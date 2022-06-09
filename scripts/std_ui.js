/*jshint esversion: 9 */
// Global variables
const { html, render: renderElem } = uhtml;
const domRefs = {};
let paymentsHistoryLoader = null;
let walletHistoryLoader = null;
let contactHistoryLoader = null;
let paymentRequestsLoader = null;

//Checks for internet connection status
if (!navigator.onLine)
    notify(
        "There seems to be a problem connecting to the internet. Please check your internet connection.",
        "error"
    );
window.addEventListener("offline", () => {
    notify(
        "There seems to be a problem connecting to the internet. Please check your internet connection.",
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

let zIndex = 50
// function required for popups or modals to appear
function openPopup(popupId, pinned) {
    zIndex++
    getRef(popupId).setAttribute('style', `z-index: ${zIndex}`)
    getRef(popupId).show({ pinned })
    return getRef(popupId);
}

// hides the popup or modal
function closePopup() {
    if (popupStack.peek() === undefined)
        return;
    popupStack.peek().popup.hide()
}

document.addEventListener('popupopened', async e => {
    getRef('main_card').setAttribute('inert', '')
    const frag = document.createDocumentFragment()
    switch (e.target.id) {
        case 'saved_ids_popup':
            getArrayOfSavedIds().forEach(({ floID, details }) => {
                frag.append(render.savedIdPickerCard(floID, details))
            })
            getRef('saved_ids_picker_list').innerHTML = ''
            getRef('saved_ids_picker_list').append(frag)
            getRef('search_saved_ids_picker').focusIn()
            break;
        case 'topup_wallet_popup':
        case 'withdraw_wallet_popup':
            let hasSavedIds = false
            for (const upiId in floGlobals.savedUserData.upiIds) {
                frag.append(render.savedUpiIdOption(upiId))
                hasSavedIds = true
            }
            if (hasSavedIds) {
                const clone = frag.cloneNode(true)
                getRef('select_withdraw_upi_id').append(clone)
                getRef('select_withdraw_upi_id').parentNode.classList.remove('hide')
            }
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
        case 'topup_wallet_popup':
            showChildElement('topup_wallet_process', 0)
            break;
        case 'withdraw_wallet_popup':
            getRef('select_withdraw_upi_id').parentNode.classList.add('hide')
            getRef('select_withdraw_upi_id').innerHTML = ''
            showChildElement('withdraw_wallet_process', 0)
            break;
        case 'transfer_to_exchange_popup':
            showChildElement('exchange_transfer_process', 0);
            break;
        case 'confirm_topup_popup':
            showChildElement('confirm_topup_wrapper', 0);
            break;
    }
    if (popupStack.items.length === 0) {
        getRef('main_card').removeAttribute('inert')
    }
})

// displays a popup for asking permission. Use this instead of JS confirm
const getConfirmation = (title, options = {}) => {
    return new Promise(resolve => {
        const { message = '', cancelText = 'Cancel', confirmText = 'OK' } = options
        openPopup('confirmation_popup', true)
        getRef('confirm_title').innerText = title;
        getRef('confirm_message').innerText = message;
        let cancelButton = getRef('confirmation_popup').children[2].children[0],
            submitButton = getRef('confirmation_popup').children[2].children[1]
        submitButton.textContent = confirmText
        cancelButton.textContent = cancelText
        submitButton.onclick = () => {
            closePopup()
            resolve(true);
        }
        cancelButton.onclick = () => {
            closePopup()
            resolve(false);
        }
    })
}
// displays a popup for asking user input. Use this instead of JS prompt
function getPromptInput(title, message = '', options = {}) {
    let { placeholder = '', isPassword = false, cancelText = 'Cancel', confirmText = 'OK' } = options
    openPopup('prompt_popup', true)
    getRef('prompt_title').innerText = title;
    getRef('prompt_message').innerText = message;
    let buttons = getRef('prompt_popup').querySelectorAll("sm-button");
    if (isPassword) {
        placeholder = 'Password'
        getRef('prompt_input').setAttribute("type", "password")
    }
    getRef('prompt_input').setAttribute("placeholder", placeholder)
    getRef('prompt_input').focusIn()
    buttons[0].textContent = cancelText;
    buttons[1].textContent = confirmText;
    return new Promise((resolve, reject) => {
        buttons[0].onclick = () => {
            closePopup()
            return (null);
        }
        buttons[1].onclick = () => {
            const value = getRef('prompt_input').value;
            closePopup()
            resolve(value)
        }
    })
}

//Function for displaying toast notifications. pass in error for mode param if you want to show an error.
function notify(message, mode, options = {}) {
    let icon
    switch (mode) {
        case 'success':
            icon = `<svg class="icon icon--success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"/></svg>`
            break;
        case 'error':
            icon = `<svg class="icon icon--error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>`
            break;
    }
    getRef("notification_drawer").push(message, { icon, ...options });
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
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            closePopup()
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
    document.querySelectorAll('.popup__header__close, .close-popup-on-click').forEach(elem => {
        elem.addEventListener('click', () => {
            closePopup()
        })
    })
});
function toggleFloIDVisibility(hide) {
    document.querySelectorAll('.flo-id-wrapper').forEach(elem => {
        if(hide)
            elem.classList.add('hide')
        else
            elem.classList.remove('hide')
    })
}
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
            getRef('contact__transactions').innerHTML = '<sm-spinner></sm-spinner>'
            Promise.all([
                floTokenAPI.fetch(`api/v1.0/getTokenTransactions?token=rupee&senderFloAddress=${myFloID}&destFloAddress=${params.floId}`),
                floTokenAPI.fetch(`api/v1.0/getTokenTransactions?token=rupee&senderFloAddress=${params.floId}&destFloAddress=${myFloID}`)])
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
            render.paymentsHistory()
            break;
        case 'wallet':
            const walletTransactions = []
            if (walletHistoryLoader)
                walletHistoryLoader.clear()
            const pendingWalletTransactions = document.createDocumentFragment()

            let areTransactionsPending = false
            for (const transactionId in User.cashierRequests) {
                if (!User.cashierRequests[transactionId].note) {
                    areTransactionsPending = true
                    pendingWalletTransactions.prepend(render.walletRequestCard(User.cashierRequests[transactionId]))
                } else {
                    walletTransactions.unshift(User.cashierRequests[transactionId])
                }
            }
            if (walletHistoryLoader) {
                walletHistoryLoader.update(walletTransactions)
            } else {
                walletHistoryLoader = new LazyLoader('#wallet_history', walletTransactions, render.walletRequestCard);
                pendingTransactionsObserver.observe(getRef('pending_wallet_transactions'), { childList: true });
            }
            if (areTransactionsPending) {
                getRef('pending_wallet_transactions').innerHTML = ''
                getRef('pending_wallet_transactions').append(pendingWalletTransactions)
            }
            walletHistoryLoader.init()
            removeNotificationBadge('wallet_history_button')
            break;
        case 'requests':
            const paymentRequests = [];
            if (paymentRequestsLoader)
                paymentRequestsLoader.clear();

            const pendingPaymentRequests = document.createDocumentFragment();
            let arePaymentsPending = false
            for (const transactionId in User.moneyRequests) {
                if (!User.moneyRequests[transactionId].note) {
                    arePaymentsPending = true
                    pendingPaymentRequests.prepend(render.paymentRequestCard(User.moneyRequests[transactionId]))
                } else {
                    paymentRequests.unshift(User.moneyRequests[transactionId])
                }
            }
            if (paymentRequestsLoader) {
                paymentRequestsLoader.update(paymentRequests)
            } else {
                paymentRequestsLoader = new LazyLoader('#payment_request_history', paymentRequests, render.paymentRequestCard);
                pendingTransactionsObserver.observe(getRef('pending_payment_requests'), { childList: true });
            }
            if (arePaymentsPending) {
                getRef('pending_payment_requests').innerHTML = ''
                getRef('pending_payment_requests').append(pendingPaymentRequests)
            }
            paymentRequestsLoader.init()
            break;
        case 'transaction':
            let transactionDetails
            let status
            let shouldRender = {}
            if (params.type === 'request') {
                transactionDetails = User.moneyRequests[params.transactionId]
                const { message: { remark }, note, tag } = transactionDetails
                status = note ? note.split(':')[0] : 'PENDING';
                getRef('transaction__type').textContent = 'Payment request'
                if (status === 'PAID')
                    shouldRender['txLink'] = `https://flosight.duckdns.org/tx/${note.split(':')[1].trim()}`;
                if (remark !== '')
                    shouldRender.txRemark = remark
            } else if (params.type === 'wallet') {
                transactionDetails = User.cashierRequests[params.transactionId]
                console.log(transactionDetails)
                const { message: { amount, mode, upi_id, upi_txid, token_txid, txCode }, note, tag } = transactionDetails
                status = tag ? tag : (note ? 'REJECTED' : "PENDING");
                getRef('transaction__type').textContent = mode === 'cash-to-token' ? 'Wallet top-up' : 'Withdraw';
                if (status === 'COMPLETED') {
                    shouldRender['txLink'] = `https://flosight.duckdns.org/tx/${mode === 'cash-to-token' ? note : token_txid}`
                } else if (status === 'REJECTED') {
                    shouldRender.txNote = html`<svg class="icon failed" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg> ${note.split(':')[1]}`
                }
                if (mode === 'cash-to-token') {
                    if (status === 'COMPLETED') {
                        if (txCode) {
                            shouldRender.txNote = `Transaction code: ${txCode}`
                        } else if (upi_txid) {
                            shouldRender.txNote = `UPI Transaction ID: ${upi_txid}`
                        }
                    } else if (status === 'REJECTED') {
                        const reason = cashierRejectionErrors.hasOwnProperty(note.split(':')[1]) ? cashierRejectionErrors[note.split(':')[1]] : note.split(':')[1]
                        shouldRender.txNote = html` <svg class="icon failed" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg> ${reason} `
                    }
                } else {
                    if (status === 'PENDING') {
                        shouldRender.txNote = `Pending transfer of ${formatAmount(amount)} to bank account linked to ${upi_id}`
                    } else if (status === 'COMPLETED') {
                        shouldRender.txNote = `Transfer of ${formatAmount(amount)} to bank account linked to ${upi_id} completed`
                    }
                }
            }
            const { message: { amount }, time, note } = transactionDetails
            let txAmount = formatAmount(amount)
            if (status === 'COMPLETED' && note.includes('#')) {
                const [txid,finalAmount] = note.split('#');
                txAmount = formatAmount(parseFloat(finalAmount));
                shouldRender.txNote = `Also received 1 FLO worth of ${formatAmount(amount - parseFloat(finalAmount))} due to low FLO balance`;
            }
            renderElem(getRef('transaction_details'), html`
                <div class="grid gap-1">
                    <div id="transaction__amount">${txAmount}</div>
                    ${shouldRender.remark ? html`<div id="transaction__remark">${shouldRender.remark}</div>` : ''}
                    <div class="flex align-center" style="font-size: 0.8rem;">
                        <time id="transaction__time">${getFormattedTime(time)}</time>
                        <div class="bullet-point"></div>
                        <span id="transaction__status">${status}</span>
                    </div>
                </div>
                ${shouldRender.txLink ? html`<a id="transaction__link" href="${shouldRender.txLink}" target="_blank">See transaction
                   
                    on blockchain</a>` : ''}
                ${shouldRender.txNote ? html`<div id="transaction__note" class="flex flex-direction-column gap-0-5">${shouldRender.txNote}</div>` : ''}
            `)
            break;
        case 'settings':
            renderSavedUpiIds()
            break;
        default:
            break;
    }
    if (pageId !== 'history') {
        if (paymentsHistoryLoader)
            paymentsHistoryLoader.clear()
    }
    if (pageId !== 'wallet') {
        if (walletHistoryLoader)
            walletHistoryLoader.clear()

    }
    if (pageId !== 'contact') {
        if (contactHistoryLoader)
            contactHistoryLoader.clear()
    }
    if (pageId !== 'settings') {
        getRef('saved_upi_ids_list').innerHTML = '';
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
            getRef('main_card').classList.remove('nav-hidden')
            if (getRef('main_navbar').classList.contains('hide')) {
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
            getRef('main_card').classList.add('nav-hidden')
            if (!getRef('main_navbar').classList.contains('hide')) {
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
    get elements() {
        return this.arrayOfElements
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

function showChildElement(id, index) {
    [...getRef(id).children].forEach((child, i) => {
        if (i === index)
            child.classList.remove('hide')
        else
            child.classList.add('hide')
    })
}

// Reactivity system
class ReactiveState {
    constructor() {
        this.state = {}
    }
    setState(key, value, callback) {
        if (this.state[key].value === value) return
        this.state[key].value = value
        this.state[key].refs.forEach(ref => {
            ref.textContent = value
        })
        if (callback)
            callback(value)
    }
    getState(key) {
        return this.state[key].value
    }
    subscribe(key, dom) {
        if (!this.state.hasOwnProperty(key)) {
            this.state[key] = {
                refs: new Set(),
                value: '',
            }
        }
        this.state[key].refs.add(dom)
        dom.textContent = this.state[key].value
    }
    unsubscribe(key, dom) {
        this.state[key].refs.delete(dom)
    }
    createState(defaultValue, key, callback) {
        if (!key)
            key = Math.random().toString(36).substr(2, 9);
        if (!this.state.hasOwnProperty(key)) {
            this.state[key] = {
                refs: new Set()
            }
        }
        this.setState(key, defaultValue, callback)
        return [
            () => this.getState(key),
            value => this.setState(key, value, callback)
        ]
    }
}
const reactiveState = new ReactiveState()
function createState(defaultValue, key, callback) {
    return reactiveState.createState(defaultValue, key, callback)
}
const smState = document.createElement('template')
smState.innerHTML = `
<style>
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
</style>
`
class SmState extends HTMLElement {
    constructor() {
        super();
        this.appendChild(smState.content.cloneNode(true));
    }
    connectedCallback() {
        reactiveState.subscribe(this.getAttribute('sid'), this)
    }
    disconnectedCallback() {
        reactiveState.unsubscribe(this.getAttribute('sid'), this)
    }
}
window.customElements.define('r-s', SmState);


// generate random string with numbers and capital and small letters
function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
function handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
        // code if page is hidden 
    } else {
        if (floGlobals.loaded && floGlobals.isSubAdmin)
            startStatusInterval()
    }
}