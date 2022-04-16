/*jshint esversion: 6 */
// Global variables
const domRefs = {};
const currentYear = new Date().getFullYear();
let paymentsHistoryLoader = null;
let walletHistoryLoader = null;
let contactHistoryLoader = null;

//Checks for internet connection status
if (!navigator.onLine)
    notify(
        "There seems to be a problem connecting to the internet, Please check you internet connection.",
        "error"
    );
window.addEventListener("offline", () => {
    notify(
        "There seems to be a problem connecting to the internet, Please check you internet connection.",
        "error",
        { pinned: true }
    );
});
window.addEventListener("online", () => {
    getRef("notification_drawer").clearAll();
    notify("We are back online.", "success");
});

// Use instead of document.getElementById
function getRef(elementId) {
    if (!domRefs.hasOwnProperty(elementId)) {
        domRefs[elementId] = {
            count: 1,
            ref: null,
        };
        return document.getElementById(elementId);
    } else {
        if (domRefs[elementId].count < 3) {
            domRefs[elementId].count = domRefs[elementId].count + 1;
            return document.getElementById(elementId);
        } else {
            if (!domRefs[elementId].ref)
                domRefs[elementId].ref = document.getElementById(elementId);
            return domRefs[elementId].ref;
        }
    }
}

// returns dom with specified element
function createElement(tagName, options = {}) {
    const { className, textContent, innerHTML, attributes = {} } = options
    const elem = document.createElement(tagName)
    for (let attribute in attributes) {
        elem.setAttribute(attribute, attributes[attribute])
    }
    if (className)
        elem.className = className
    if (textContent)
        elem.textContent = textContent
    if (innerHTML)
        elem.innerHTML = innerHTML
    return elem
}

// Use when a function needs to be executed after user finishes changes
const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}

let zIndex = 10
// function required for popups or modals to appear
function showPopup(popupId, pinned) {
    zIndex++
    getRef(popupId).setAttribute('style', `z-index: ${zIndex}`)
    getRef(popupId).show({ pinned })
    return getRef(popupId);
}

// hides the popup or modal
function hidePopup() {
    if (popupStack.peek() === undefined)
        return;
    popupStack.peek().popup.hide()
}

document.addEventListener('popupopened', async e => {
    switch (e.target.id) {
        case 'saved_ids_popup':
            const frag = document.createDocumentFragment()
            const allSavedIds = await getArrayOfSavedIds()
            allSavedIds.forEach(({ floID, name }) => {
                frag.append(render.savedIdPickerCard(floID, name))
            })
            getRef('saved_ids_picker_list').innerHTML = ''
            getRef('saved_ids_picker_list').append(frag)
            getRef('search_saved_ids_picker').focusIn()
            break;
        case 'get_private_key_popup':
            break;
    }
})
document.addEventListener('popupclosed', e => {
    zIndex--
    switch (e.target.id) {
        case 'saved_ids_popup':
            getRef('saved_ids_picker_list').innerHTML = ''
            getRef('search_saved_ids_picker').value = ''
            break;
        case 'get_private_key_popup':
            getRef('get_private_key').classList.remove('hide')
            getRef('transaction_result').classList.add('hide')
            getRef('confirm_transaction_button').classList.remove('hide')
            getRef('confirm_transaction_button').nextElementSibling.classList.add('hide')
            break;
        case 'retrieve_flo_id_popup':
            getRef('recovered_flo_id_wrapper').classList.add('hide')
            break;
    }
})

// displays a popup for asking permission. Use this instead of JS confirm
const getConfirmation = (title, options = {}) => {
    return new Promise(resolve => {
        const { message, cancelText = 'Cancel', confirmText = 'OK' } = options
        showPopup('confirmation_popup', true)
        getRef('confirm_title').textContent = title;
        getRef('confirm_message').textContent = message;
        let cancelButton = getRef('confirmation_popup').children[2].children[0],
            submitButton = getRef('confirmation_popup').children[2].children[1]
        submitButton.textContent = confirmText
        cancelButton.textContent = cancelText
        submitButton.onclick = () => {
            hidePopup()
            resolve(true);
        }
        cancelButton.onclick = () => {
            hidePopup()
            resolve(false);
        }
    })
}

//Function for displaying toast notifications. pass in error for mode param if you want to show an error.
function notify(message, mode, options = {}) {
    const { pinned = false, sound = false } = options
    let icon
    switch (mode) {
        case 'success':
            icon = `<svg class="icon icon--success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"/></svg>`
            break;
        case 'error':
            icon = `<svg class="icon icon--error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>`
            break;
    }
    getRef("notification_drawer").push(message, { pinned, icon });
    if (mode === 'error') {
        console.error(message)
    }
}

function getFormattedTime(time, format) {
    try {
        if (String(time).indexOf('_'))
            time = String(time).split('_')[0]
        const intTime = parseInt(time)
        if (String(intTime).length < 13)
            time *= 1000
        let [day, month, date, year] = new Date(intTime).toString().split(' '),
            minutes = new Date(intTime).getMinutes(),
            hours = new Date(intTime).getHours(),
            currentTime = new Date().toString().split(' ')

        minutes = minutes < 10 ? `0${minutes}` : minutes
        let finalHours = ``;
        if (hours > 12)
            finalHours = `${hours - 12}:${minutes}`
        else if (hours === 0)
            finalHours = `12:${minutes}`
        else
            finalHours = `${hours}:${minutes}`

        finalHours = hours >= 12 ? `${finalHours} PM` : `${finalHours} AM`
        switch (format) {
            case 'date-only':
                return `${month} ${date}, ${year}`;
                break;
            default:
                return `${month} ${date}, ${year} at ${finalHours}`;
        }
    } catch (e) {
        console.error(e);
        return time;
    }
}
// implement event delegation
function delegate(el, event, selector, fn) {
    el.addEventListener(event, function (e) {
        const potentialTarget = e.target.closest(selector)
        if (potentialTarget) {
            e.delegateTarget = potentialTarget
            fn.call(this, e)
        }
    })
}

window.addEventListener('hashchange', e => showPage(window.location.hash))
window.addEventListener("load", () => {
    document.body.classList.remove('hide')
    document.querySelectorAll('sm-input[data-flo-id]').forEach(input => input.customValidation = floCrypto.validateAddr)
    document.querySelectorAll('sm-input[data-private-key]').forEach(input => input.customValidation = floCrypto.getPubKeyHex)
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            hidePopup()
        }
    })
    document.addEventListener('copy', () => {
        notify('copied', 'success')
    })
    document.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button:not([disabled]), sm-button:not([disabled]), .interact")) {
            createRipple(e, e.target.closest("button, sm-button, .interact"));
        }
    });

});
function createRipple(event, target) {
    const circle = document.createElement("span");
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;
    const targetDimensions = target.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (targetDimensions.left + radius)}px`;
    circle.style.top = `${event.clientY - (targetDimensions.top + radius)}px`;
    circle.classList.add("ripple");
    const rippleAnimation = circle.animate(
        [
            {
                transform: "scale(4)",
                opacity: 0,
            },
        ],
        {
            duration: 600,
            fill: "forwards",
            easing: "ease-out",
        }
    );
    target.append(circle);
    rippleAnimation.onfinish = () => {
        circle.remove();
    };
}

const pagesData = {
    params: {},
    openedPages: new Set(),
}

async function showPage(targetPage, options = {}) {
    const { firstLoad, hashChange } = options
    let pageId
    let params = {}
    let searchParams
    if (targetPage === '') {
        if (typeof myFloID === "undefined") {
            pageId = 'sign_in'
        } else {
            pageId = 'home'
        }
    } else {
        if (targetPage.includes('/')) {
            if (targetPage.includes('?')) {
                const splitAddress = targetPage.split('?')
                searchParams = splitAddress.pop()
                const pages = splitAddress.pop().split('/')
                pageId = pages[1]
                subPageId = pages[2]
            } else {
                const pages = targetPage.split('/')
                pageId = pages[1]
                subPageId = pages[2]
            }
        } else {
            pageId = targetPage
        }
    }
    if (typeof myFloID === "undefined" && !(['sign_up', 'sign_in', 'loading', 'landing'].includes(pageId))) return
    else if (typeof myFloID !== "undefined" && (['sign_up', 'sign_in', 'loading', 'landing'].includes(pageId))) {
        history.replaceState(null, null, '#/home');
        pageId = 'home'
    }
    if (searchParams) {
        const urlSearchParams = new URLSearchParams('?' + searchParams);
        params = Object.fromEntries(urlSearchParams.entries());
    }
    switch (pageId) {
        case 'sign_in':
            setTimeout(() => {
                getRef('private_key_field').focusIn()
            }, 0);
            targetPage = 'sign_in'
            break;
        case 'sign_up':
            const { floID, privKey } = floCrypto.generateNewID()
            getRef('generated_flo_id').value = floID
            getRef('generated_private_key').value = privKey
            targetPage = 'sign_up'
            break;
        case 'contact':
            getRef('contact__title').textContent = getFloIdTitle(params.floId)
            Promise.all([
                tokenAPI.fetch_api(`api/v1.0/getTokenTransactions?token=rupee&senderFloAddress=${myFloID}&destFloAddress=${params.floId}`),
                tokenAPI.fetch_api(`api/v1.0/getTokenTransactions?token=rupee&senderFloAddress=${params.floId}&destFloAddress=${myFloID}`)])
                .then(([sentTransactions, receivedTransactions]) => {
                    const allTransactions = Object.values({ ...sentTransactions.transactions, ...receivedTransactions.transactions }).sort((a, b) => b.transactionDetails.time - a.transactionDetails.time)
                    if (contactHistoryLoader) {
                        contactHistoryLoader.update(allTransactions)
                    } else {
                        contactHistoryLoader = new LazyLoader('#contact__transactions', allTransactions, render.transactionMessage, { bottomFirst: true });
                    }
                    contactHistoryLoader.init()
                }).catch(err => {
                    console.error(err)
                })
            break;
        case 'history':
            const paymentTransactions = []
            if (paymentsHistoryLoader)
                paymentsHistoryLoader.clear()
            getRef('payments_history').innerHTML = '<sm-spinner></sm-spinner>'
            tokenAPI.getAllTxs(myFloID).then(({ transactions }) => {
                for (const transactionId in transactions) {
                    paymentTransactions.push({
                        ...tokenAPI.util.parseTxData(transactions[transactionId]),
                        txid: transactionId
                    })
                }
                if (paymentsHistoryLoader) {
                    paymentsHistoryLoader.update(paymentTransactions)
                } else {
                    paymentsHistoryLoader = new LazyLoader('#payments_history', paymentTransactions, render.transactionCard);
                }
                paymentsHistoryLoader.init()
            }).catch(e => {
                console.error(e)
            })
            break;
        case 'wallet':
            const walletTransactions = []
            if (walletHistoryLoader)
                walletHistoryLoader.clear()
            getRef('wallet_history').innerHTML = '<sm-spinner></sm-spinner>'
            const requests = User.cashierRequests;
            for (const transactionId in requests) {
                walletTransactions.push(User.cashierRequests[transactionId])
            }
            if (walletHistoryLoader) {
                walletHistoryLoader.update(walletTransactions)
            } else {
                walletHistoryLoader = new LazyLoader('#wallet_history', walletTransactions, render.walletRequestCard);
            }
            walletHistoryLoader.init()
            break;
        default:
            break;
    }
    if (pageId !== 'history') {
        if (paymentsHistoryLoader)
            paymentsHistoryLoader.clear()
    }
    if (pageId !== 'contact') {
        if (contactHistoryLoader)
            contactHistoryLoader.clear()
    }
    if (pageId !== 'wallet') {
        if (walletHistoryLoader)
            walletHistoryLoader.clear()
    }

    if (pagesData.lastPage !== pageId) {
        const animOptions = {
            duration: 100,
            fill: 'forwards',
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }
        let previousActiveElement = getRef('main_navbar').querySelector('.nav-item--active')
        const currentActiveElement = document.querySelector(`.nav-item[href="#/${pageId}"]`)
        if (currentActiveElement) {
            if (getRef('main_navbar').classList.contains('hide')) {
                getRef('main_card').classList.remove('nav-hidden')
                getRef('main_navbar').classList.remove('hide-away')
                getRef('main_navbar').classList.remove('hide')
                getRef('main_navbar').animate([
                    {
                        transform: isMobileView ? `translateY(100%)` : `translateX(-100%)`,
                        opacity: 0,
                    },
                    {
                        transform: `none`,
                        opacity: 1,
                    },
                ], { ...animOptions, easing: 'ease-in' })
            }
            getRef('main_header').classList.remove('hide')
            const previousActiveElementIndex = [...getRef('main_navbar').querySelectorAll('.nav-item')].indexOf(previousActiveElement)
            const currentActiveElementIndex = [...getRef('main_navbar').querySelectorAll('.nav-item')].indexOf(currentActiveElement)
            const isOnTop = previousActiveElementIndex < currentActiveElementIndex
            const currentIndicator = createElement('div', { className: 'nav-item__indicator' });
            let previousIndicator = getRef('main_navbar').querySelector('.nav-item__indicator')
            if (!previousIndicator) {
                previousIndicator = currentIndicator.cloneNode(true)
                previousActiveElement = currentActiveElement
                previousActiveElement.append(previousIndicator)
            } else if (currentActiveElementIndex !== previousActiveElementIndex) {
                const indicatorDimensions = previousIndicator.getBoundingClientRect()
                const currentActiveElementDimensions = currentActiveElement.getBoundingClientRect()
                let moveBy
                if (isMobileView) {
                    moveBy = ((currentActiveElementDimensions.width - indicatorDimensions.width) / 2) + indicatorDimensions.width
                } else {
                    moveBy = ((currentActiveElementDimensions.height - indicatorDimensions.height) / 2) + indicatorDimensions.height
                }
                indicatorObserver.observe(previousIndicator)
                previousIndicator.animate([
                    {
                        transform: 'none',
                        opacity: 1,
                    },
                    {
                        transform: `translate${isMobileView ? 'X' : 'Y'}(${isOnTop ? `${moveBy}px` : `-${moveBy}px`})`,
                        opacity: 0,
                    },
                ], { ...animOptions, easing: 'ease-in' }).onfinish = () => {
                    previousIndicator.remove()
                }
                tempData = {
                    currentActiveElement,
                    currentIndicator,
                    isOnTop,
                    animOptions,
                    moveBy
                }
            }
            previousActiveElement.classList.remove('nav-item--active');
            currentActiveElement.classList.add('nav-item--active')
        } else {
            if (!getRef('main_navbar').classList.contains('hide')) {
                getRef('main_card').classList.add('nav-hidden')
                getRef('main_navbar').classList.add('hide-away')
                getRef('main_navbar').animate([
                    {
                        transform: `none`,
                        opacity: 1,
                    },
                    {
                        transform: isMobileView ? `translateY(100%)` : `translateX(-100%)`,
                        opacity: 0,
                    },
                ], {
                    duration: 200,
                    fill: 'forwards',
                    easing: 'ease'
                }).onfinish = () => {
                    getRef('main_navbar').classList.add('hide')
                }
                getRef('main_header').classList.add('hide')
            }
        }
        document.querySelectorAll('.page').forEach(page => page.classList.add('hide'))
        getRef(pageId).closest('.page').classList.remove('hide')
        document.querySelectorAll('.inner-page').forEach(page => page.classList.add('hide'))
        getRef(pageId).classList.remove('hide')
        getRef('main_card').style.overflowY = "hidden";
        getRef(pageId).animate([
            {
                opacity: 0,
                transform: 'translateY(1rem)'
            },
            {
                opacity: 1,
                transform: 'translateY(0)'
            },
        ],
            {
                duration: 300,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }).onfinish = () => {
                getRef('main_card').style.overflowY = "";
            }
        pagesData.lastPage = pageId
    }
    if (params)
        pagesData.params = params
    pagesData.openedPages.add(pageId)

}
const indicatorObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            const { currentActiveElement, currentIndicator, isOnTop, animOptions, moveBy } = tempData
            currentActiveElement.append(currentIndicator)
            currentIndicator.animate([
                {
                    transform: `translate${isMobileView ? 'X' : 'Y'}(${isOnTop ? `-${moveBy}px` : `${moveBy}px`})`,
                    opacity: 0,
                },
                {
                    transform: 'none',
                    opacity: 1
                },
            ], { ...animOptions, easing: 'ease-out' })
        }
    })
}, {
    threshold: 1
})

// class based lazy loading
class LazyLoader {
    constructor(container, elementsToRender, renderFn, options = {}) {
        const { batchSize = 10, freshRender, bottomFirst = false } = options

        this.elementsToRender = elementsToRender
        this.arrayOfElements = (typeof elementsToRender === 'function') ? this.elementsToRender() : elementsToRender || []
        this.renderFn = renderFn
        this.intersectionObserver

        this.batchSize = batchSize
        this.freshRender = freshRender
        this.bottomFirst = bottomFirst

        this.lazyContainer = document.querySelector(container)

        this.update = this.update.bind(this)
        this.render = this.render.bind(this)
        this.init = this.init.bind(this)
        this.clear = this.clear.bind(this)
    }
    init() {
        this.intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.disconnect()
                    this.render({ lazyLoad: true })
                }
            })
        }, {
            threshold: 0.3
        })
        this.mutationObserver = new MutationObserver(mutationList => {
            mutationList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length) {
                        if (this.bottomFirst)
                            this.intersectionObserver.observe(this.lazyContainer.firstElementChild)
                        else
                            this.intersectionObserver.observe(this.lazyContainer.lastElementChild)

                    }
                }
            })
        })
        this.mutationObserver.observe(this.lazyContainer, {
            childList: true,
        })
        this.render()
    }
    update(elementsToRender) {
        this.arrayOfElements = (typeof elementsToRender === 'function') ? this.elementsToRender() : elementsToRender || []
    }
    render(options = {}) {
        let { lazyLoad = false } = options
        const frag = document.createDocumentFragment();
        if (lazyLoad) {
            this.updateStartIndex = this.updateEndIndex
            this.updateEndIndex = this.arrayOfElements.length > this.updateEndIndex + this.batchSize ? this.updateEndIndex + this.batchSize : this.arrayOfElements.length
        } else {
            this.intersectionObserver.disconnect()
            this.lazyContainer.innerHTML = ``;
            this.updateStartIndex = 0
            this.updateEndIndex = this.arrayOfElements.length > this.batchSize ? this.batchSize : this.arrayOfElements.length
        }
        if (this.bottomFirst) {
            for (let index = this.updateStartIndex; index < this.updateEndIndex; index++) {
                frag.prepend(this.renderFn(this.arrayOfElements[index]))
            }
            this.lazyContainer.prepend(frag)
        } else {
            for (let index = this.updateStartIndex; index < this.updateEndIndex; index++) {
                frag.append(this.renderFn(this.arrayOfElements[index]))
            }
            this.lazyContainer.append(frag)
        }
        if (!lazyLoad && this.bottomFirst)
            this.lazyContainer.scrollTo({
                top: this.lazyContainer.scrollHeight,
            })
        // Callback to be called if elements are updated or rendered for first time
        if (!lazyLoad && this.freshRender)
            this.freshRender()
    }
    clear() {
        this.intersectionObserver.disconnect()
        this.mutationObserver.disconnect()
        this.lazyContainer.innerHTML = ``;
    }
    reset() {
        this.arrayOfElements = (typeof this.elementsToRender === 'function') ? this.elementsToRender() : this.elementsToRender || []
        this.render()
    }
}
function animateTo(element, keyframes, options) {
    const anime = element.animate(keyframes, { ...options, fill: 'both' })
    anime.finished.then(() => {
        anime.commitStyles()
        anime.cancel()
    })
    return anime
}
let isMobileView = false
const mobileQuery = window.matchMedia('(max-width: 40rem)')
function handleMobileChange(e) {
    isMobileView = e.matches
}
mobileQuery.addEventListener('change', handleMobileChange)
handleMobileChange(mobileQuery)