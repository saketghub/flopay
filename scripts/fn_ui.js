/*jshint esversion: 8 */
/**
  * @yaireo/relative-time - javascript function to transform timestamp or date to local relative-time
  *
  * @version v1.0.0
  * @homepage https://github.com/yairEO/relative-time
  */

!function (e, t) { var o = o || {}; "function" == typeof o && o.amd ? o([], t) : "object" == typeof exports && "object" == typeof module ? module.exports = t() : "object" == typeof exports ? exports.RelativeTime = t() : e.RelativeTime = t() }(this, (function () { const e = { year: 31536e6, month: 2628e6, day: 864e5, hour: 36e5, minute: 6e4, second: 1e3 }, t = "en", o = { numeric: "auto" }; function n(e) { e = { locale: (e = e || {}).locale || t, options: { ...o, ...e.options } }, this.rtf = new Intl.RelativeTimeFormat(e.locale, e.options) } return n.prototype = { from(t, o) { const n = t - (o || new Date); for (let t in e) if (Math.abs(n) > e[t] || "second" == t) return this.rtf.format(Math.round(n / e[t]), t) } }, n }));

const relativeTime = new RelativeTime({ style: 'narrow' });

function syncUserData(obsName, data) {
    const dataToSend = Crypto.AES.encrypt(JSON.stringify(data), myPrivKey);
    return floCloudAPI.sendApplicationData(dataToSend, obsName, { receiverID: myFloID });
}
async function organizeSyncedData(obsName) {
    const fetchedData = await floCloudAPI.requestApplicationData(obsName, { mostRecent: true, senderIDs: [myFloID], receiverID: myFloID });
    if (fetchedData.length && await compactIDB.readData(obsName, 'lastSyncTime') !== fetchedData[0].time) {
        await compactIDB.clearData(obsName);
        const dataToDecrypt = floCloudAPI.util.decodeMessage(fetchedData[0].message);
        const decryptedData = JSON.parse(Crypto.AES.decrypt(dataToDecrypt, myPrivKey));
        for (let key in decryptedData) {
            floGlobals[obsName][key] = decryptedData[key];
            compactIDB.addData(obsName, decryptedData[key], key);
        }
        compactIDB.addData(obsName, fetchedData[0].time, 'lastSyncTime');
        return true;
    } else {
        const idbData = await compactIDB.readAllData(obsName);
        for (const key in idbData) {
            if (key !== 'lastSyncTime')
                floGlobals[obsName][key] = idbData[key];
        }
        return true;
    }
}

const userUI = {};
function continueWalletTopup() {
    let cashier = User.findCashier();
    if (!cashier)
        return notify("No cashier online. Please try again in a while.", 'error');
    // const upiId = getRef('select_topup_upi_id').value;
    const txCode =  randomString(6);
    getRef('topup_wallet__code').value = txCode;
    // if (!upiId)
    //     return notify("Please add the UPI ID which you'll use to send the money", 'error');
    let amount = parseFloat(getRef('request_cashier_amount').value.trim());
    renderElem(getRef('topup_wallet__details'), html`Enter <b>${formatAmount(amount)}</b> as amount`);
    getRef('topup_wallet__upi_id').value = cashierUPI[cashier];
    getRef('topup_wallet__qr_code').innerHTML = ''
    getRef('topup_wallet__qr_code').append(new QRCode({
        msg: `upi://pay?pn=FLOPay&pa=${cashierUPI[cashier]}&am=${amount}&tn=${txCode}`,
        ecl: 'H'
    }))
    showChildElement('topup_wallet_process', 1)
    // getRef('topup_wallet__txid').focusIn();
}
function depositMoneyToWallet() {
    let cashier = User.findCashier();
    if (!cashier)
        return notify("No cashier online. Please try again in a while.", 'error');
    let amount = parseFloat(getRef('request_cashier_amount').value.trim());
    // let upiTxID = getRef('topup_wallet__txid').value.trim();
    const txCode = getRef('topup_wallet__code').value;
    // const upiId = getRef('select_topup_upi_id').value;
    // if (upiTxID === '')
    //     return notify("Please enter UPI transaction ID", 'error');
    buttonLoader('topup_wallet_button', true);
    User.cashToToken(cashier, amount, txCode/* , upiId */).then(result => {
        console.log(result);
        showChildElement('topup_wallet_process', 2);
        refreshBalance()
    }).catch(error => {
        console.error(error)
        getRef('topup_failed_reason').textContent = error;
        showChildElement('topup_wallet_process', 3);
    }).finally(() => {
        buttonLoader('topup_wallet_button', false);
    });
}

function withdrawMoneyFromWallet() {
    let cashier = User.findCashier();
    if (!cashier)
        return notify("No cashier online. Please try again in a while.", 'error');
    let amount = parseFloat(getRef('send_cashier_amount').value.trim());
    const upiId = getRef('select_withdraw_upi_id').value;
    if (!upiId)
        return notify("Please add an UPI ID to continue", 'error');
    buttonLoader('withdraw_rupee_button', true);
    getRef('withdrawal_blockchain_link').classList.add('hide');
    User.sendToken(cashier, amount, 'for token-to-cash').then(txid => {
        console.warn(`Withdraw ${amount} from cashier ${cashier}`, txid);
        User.tokenToCash(cashier, amount, txid, upiId).then(result => {
            showChildElement('withdraw_wallet_process', 1);
            refreshBalance();
            getRef('withdrawal_blockchain_link').classList.remove('hide');
            getRef('withdrawal_blockchain_link').href = `https://flosight.duckdns.org/tx/${txid}`
            console.log(result);
        }).catch(error => {
            getRef('withdrawal_failed_reason').textContent = error;
            showChildElement('withdraw_wallet_process', 2);
            console.error(error)
        }).finally(() => {
            buttonLoader('withdraw_rupee_button', false);
        });
    }).catch(error => {
        getRef('withdrawal_failed_reason').textContent = error;
        showChildElement('withdraw_wallet_process', 2);
        buttonLoader('withdraw_rupee_button', false);
        console.error(error)
    })
}

function transferToExchange() {
    const amount = parseFloat(getRef('exchange_transfer__amount').value.trim());
    buttonLoader('exchange_transfer__button', true);
    floExchangeAPI.depositToken('rupee', amount, myFloID, 'FRJkPqdbbsug3TtQRAWviqvTL9Qr2EMnrm', myPrivKey).then(txid => {
        console.log(txid);
        showChildElement('exchange_transfer_process', 1);
        getRef('exchange_transfer__success_message').textContent = `Transferred ${formatAmount(amount)} to exchange`;
    }).catch(error => {
        console.log(error);
        if (error.code) {
            error = error.message;
        }
        if (error === 'Insufficient rupee# balance')
            error = 'Insufficient rupee token balance in your wallet, please top-up your wallet.';
        getRef('exchange_transfer__failed_reason').textContent = error;
        showChildElement('exchange_transfer_process', 2);
    }).finally(() => {
        buttonLoader('exchange_transfer__button', false);
    });
}

async function renderSavedUpiIds() {
    const frag = document.createDocumentFragment();
    for (const upiId in floGlobals.savedUserData.upiIds) {
        frag.append(render.savedUpiId(upiId));
    }
    getRef('saved_upi_ids_list').innerHTML = '';
    getRef('saved_upi_ids_list').append(frag);
}
function saveUpiId() {
    const frag = document.createDocumentFragment();
    const upiId = getRef('get_upi_id').value.trim();
    if (upiId === '')
        return notify("Please add an UPI ID to continue", 'error');
    if (floGlobals.savedUserData.upiIds.hasOwnProperty(upiId))
        return notify('This UPI ID is already saved', 'error');
    floGlobals.savedUserData.upiIds[upiId] = {}
    syncUserData('savedUserData', floGlobals.savedUserData).then(() => {
        notify(`Saved ${upiId}`, 'success');
        if (pagesData.lastPage === 'settings') {
            getRef('saved_upi_ids_list').append(render.savedUpiId(upiId));
        } else if (pagesData.lastPage === 'home') {
            // getRef('select_topup_upi_id').append(render.savedUpiIdOption(upiId));
            // getRef('select_topup_upi_id').parentNode.classList.remove('hide')
            getRef('select_withdraw_upi_id').append(render.savedUpiIdOption(upiId));
            getRef('select_withdraw_upi_id').parentNode.classList.remove('hide')
        }
        closePopup();
    }).catch(error => {
        notify(error, 'error');
    })
}
delegate(getRef('saved_upi_ids_list'), 'click', '.saved-upi', e => {
    if (e.target.closest('.delete-upi')) {
        const upiId = e.delegateTarget.dataset.upiId;
        getConfirmation('Do you want delete this UPI ID?', {
            confirmText: 'Delete',
        }).then(res => {
            if (res) {
                const toDelete = getRef('saved_upi_ids_list').querySelector(`.saved-upi[data-upi-id="${upiId}"]`);
                if (toDelete)
                    toDelete.remove();
                delete floGlobals.savedUserData.upiIds[upiId];
                closePopup();
                syncUserData('savedUserData', floGlobals.savedUserData).then(() => {
                    notify(`Deleted UPI ID`, 'success');
                }).catch(error => {
                    notify(error, 'error');
                });
            }
        });
    }
});

userUI.renderCashierRequests = function (requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    let processedRequests = 0;
    for (let transactionID in requests) {
        const { message: {amount,mode}, note, tag } = requests[transactionID];
        let status = tag ? 'completed' : (note ? 'rejected' : "pending");
        console.log(requests[transactionID])
        if (status !== 'pending') {
            processedRequests++;
        }
        if (pagesData.lastPage === 'wallet') {
            getRef('wallet_history_wrapper').querySelectorAll(`[data-vc="${transactionID}"]`).forEach(card => card.remove());
            getRef(status !== 'pending' ? 'wallet_history' : 'pending_wallet_transactions').prepend(render.walletRequestCard(requests[transactionID]))
        }
        if (floGlobals.loaded&& status !== 'pending') {
            const { message: {amount,mode}, note, tag } = requests[transactionID];
            notify(`Your ${mode ==='cash-to-token'? 'top-up': 'withdraw'} request of ${formatAmount(amount)} has been ${status}`, status === 'completed' ? 'success' : 'error', {
                action: {
                    label: 'View',
                    callback: () => {
                        window.location.hash = `#/wallet`
                    }
                }
            });
        }
    } 
    if(pagesData.lastPage !== 'wallet') {
        if(processedRequests === 0)
        removeNotificationBadge('wallet_history_button');
        else {
            addNotificationBadge('wallet_history_button', processedRequests)
        }
    }
};

const pendingTransactionsObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            if (mutation.target.children.length)
                mutation.target.parentNode.classList.remove('hide')
            else
                mutation.target.parentNode.classList.add('hide')

        }
    })
});

userUI.renderMoneyRequests = function (requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    if (pagesData.lastPage === 'requests') {
        for (let r in requests) {
            getRef('requests_history_wrapper').querySelectorAll(`[data-vc="${r}"]`).forEach(card => card.remove());
            if (requests[r].note) {
                getRef('payment_request_history').prepend(render.paymentRequestCard(requests[r]));
            } else {
                getRef('pending_payment_requests').prepend(render.paymentRequestCard(requests[r]));
            }
        }
    }
    if (floGlobals.loaded) {
        for (let r in requests) {
            if (!requests[r].note) {
                notify(`You have received payment request from ${getFloIdTitle(requests[r].senderID)}`, '', {
                    action: {
                        label: 'View',
                        callback: () => {
                            window.location.hash = `#/requests`
                        }
                    }
                });
            }
        }
    }
    let totalRequests = 0;
    for (const request in User.moneyRequests) {
        if (!User.moneyRequests[request].note) totalRequests++;
    }
    if (totalRequests) {
        addNotificationBadge('requests_page_button',totalRequests)
    } else {
        removeNotificationBadge('requests_page_button')
    }
};

function addNotificationBadge(elem, text) {
    const animOptions = {
        duration: 200,
        fill: 'forwards',
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
    if (!getRef(elem).querySelector('.badge')) {
        const badge = createElement('span', {
            className: 'badge',
            textContent: text
        })
        getRef(elem).append(badge)
        badge.animate([
            {
                transform: 'scale(0) translateY(0.5rem)'
            },
            {
                transform: 'scale(1) translateY(0)'
            },
        ], animOptions)
    } else {
        const badge = getRef(elem).querySelector('.badge');
        badge.textContent = text;
        badge.animate([
            { transform: 'scale(1)' },
            { transform: `scale(1.5)` },
            { transform: 'scale(1)' }
        ], animOptions)
    }
}

function removeNotificationBadge(elem) {
    const animOptions = {
        duration: 200,
        fill: 'forwards',
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
    if (getRef(elem).querySelector('.badge')) {
        const badge = getRef(elem).querySelector('.badge')
        badge.animate([
            {
                transform: 'scale(1) translateY(0)'
            },
            {
                transform: 'scale(0) translateY(0.5rem)'
            },
        ], animOptions).onfinish = () => {
            badge.remove()
        }
    }
}

userUI.payRequest = function (reqID) {
    let { message: { amount, remark }, senderID } = User.moneyRequests[reqID];
    getConfirmation('Pay?', { message: `Do you want to pay ${amount} to ${senderID}?`, confirmText: 'Pay' }).then(confirmation => {
        if (confirmation) {
            User.sendToken(senderID, amount, "|" + remark).then(txid => {
                console.warn(`Sent ${amount} to ${senderID}`, txid);
                notify(`Sent ${formatAmount(amount)} to ${getFloIdTitle(senderID)}. It may take a few mins to reflect in their wallet`, 'success');
                User.decideRequest(User.moneyRequests[reqID], 'PAID: ' + txid)
                    .then(result => console.log(result))
                    .catch(error => console.error(error))
            }).catch(error => console.error(error));
        }
    })
}

userUI.declineRequest = function (reqID) {
    let request = User.moneyRequests[reqID];
    getConfirmation('Decline payment?', { confirmText: 'Decline' }).then(confirmation => {
        if (confirmation) {
            User.decideRequest(request, "DECLINED").then(result => {
                console.log(result);
                notify("Request declined", 'success');
            }).catch(error => console.error(error))
        }
    })
}

delegate(getRef('pending_payment_requests'), 'click', '.pay-requested', e => {
    const vectorClock = e.target.closest('.payment-request').dataset.vc;
    userUI.payRequest(vectorClock);
})
delegate(getRef('pending_payment_requests'), 'click', '.decline-payment', e => {
    const vectorClock = e.target.closest('.payment-request').dataset.vc;
    userUI.declineRequest(vectorClock);
})

//Cashier
const cashierUI = {};

cashierUI.renderRequests = function (requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    for (let transactionID in requests) {
        const { note, tag } = requests[transactionID];
        let status = tag ? 'done' : (note ? 'failed' : "pending");
        getRef('cashier_requests_wrapper').querySelectorAll(`[data-vc="${transactionID}"]`).forEach(card => card.remove());
        getRef(status === 'pending' ? 'cashier_pending_request_list' : 'cashier_processed_request_list').prepend(render.cashierRequestCard(requests[transactionID]))
    }
}

cashierUI.completeRequest = function (reqID) {
    floGlobals.cashierProcessingRequest = Cashier.Requests[reqID];
    const { message: { mode } } = floGlobals.cashierProcessingRequest;
    if (mode === "cash-to-token")
        completeCashToTokenRequest(floGlobals.cashierProcessingRequest);
    else if (mode === "token-to-cash")
        completeTokenToCashRequest(floGlobals.cashierProcessingRequest);
}

function completeCashToTokenRequest(request) {
    const { message: { upi_txid, amount, upiID, txCode }, vectorClock } = request;
        getRef('top_up_amount').textContent = formatAmount(amount);
        getRef('top_up__code').value = txCode;
        openPopup('confirm_topup_popup');
    // Cashier.checkIfUpiTxIsValid(upi_txid).then(_ => {
    //     getRef('top_up_amount').textContent = formatAmount(amount);
    //     // getRef('top_up_txid').value = upi_txid;
    //     // getRef('top_up_upi_id').value = upiID;
    //     getRef('top_up__code').value = txCode;
    //     openPopup('confirm_topup_popup');
    // }).catch(error => {
    //     notify(Array.isArray(error) ? error[1]: error, 'error');
    //     if (Array.isArray(error) && error[0] === true && typeof error[1] === 'string')
    //         Cashier.rejectRequest(request, error[1]).then(result => {
    //             console.log(result);
    //             console.info('Rejected cash-to-token request:', vectorClock);
    //         }).catch(error => console.error(error))
    // })
}

function confirmTopUp(button) {
    const { message: { amount }, vectorClock, senderID } = floGlobals.cashierProcessingRequest;
    var tokenAmt = amount;
    buttonLoader(button, true);
    floBlockchainAPI.getBalance(senderID).then(async user_balance => {
        let floAmt = floGlobals.sendAmt;
        if (user_balance < floGlobals.settings.user_flo_threshold) {
            let cur_rate = (await floExchangeAPI.getRates("FLO")).rate;
            floAmt = floGlobals.settings.send_user_flo;
            tokenAmt -= cur_rate * floAmt;
        }
        User.sendToken(senderID, tokenAmt, 'for cash-to-token', { sendAmt: floAmt }).then(txid => {
            console.warn(`${amount} (${tokenAmt}|${floAmt}) cash-to-token for ${senderID}`, txid);
            Cashier.finishRequest(floGlobals.cashierProcessingRequest, txid).then(result => {
                console.log(result);
                console.info('Completed cash-to-token request:', vectorClock);
                notify("Completed request", 'success');
                closePopup()
            }).catch(error => console.error(error))
                .finally(() => buttonLoader(button, false));
        }).catch(error => {
            console.error(error)
            buttonLoader(button, false);
        })
    }).catch(error => {
        buttonLoader(button, false);
        console.error(error)
    })
}

getRef('top_up__reason_selector').addEventListener('change', e => {
    console.log(e.target.value);
    if (e.target.value === 'other') {
        getRef('top_up__specified_reason').parentNode.classList.remove('hide');
    } else {
        getRef('top_up__specified_reason').parentNode.classList.add('hide');
    }
})
function declineTopUp() {
    const { vectorClock } = floGlobals.cashierProcessingRequest;
    let reason = getRef('top_up__reason_selector').value;
    if (reason === 'other') {
        reason = getRef('top_up__specified_reason').value
    }
    if (reason.trim() === '')
        return notify('Please specify a reason', 'error');
    buttonLoader('decline_button', true);
    Cashier.rejectRequest(floGlobals.cashierProcessingRequest, reason).then(result => {
        console.log(result);
        console.info('Rejected cash-to-token request:', vectorClock);
        notify('Rejected top-up request', 'success');
        closePopup()
    }).catch(error => console.error(error)).finally(() => buttonLoader('decline_button', false));
}


function completeTokenToCashRequest(request) {
    const { vectorClock, senderID, message: { token_txid, amount, upi_id } } = request;
    var upiID;
    if (upi_id instanceof Object && "secret" in upi_id) {
        try {
            upiID = floCrypto.decryptData(upi_id, myPrivKey);
        } catch (error) {
            console.error("UPI ID is not encrypted with a proper key", error);
            return notify("Invalid UPI ID", 'error');
        }
    } else
        upiID = upi_id;
    Cashier.checkIfTokenTxIsValid(token_txid, senderID, amount).then(result => {
        getPromptInput('Process', `Token transfer is verified!\n Send ${formatAmount(amount)}\n to ${upiID}\n Enter UPI transaction ID`, {
            placeholder: 'UPI transaction ID',
        }).then(upiTxID => {
            if (!upiTxID || upiTxID.length < 10)
                return notify("Invalid UPI txid", 'error');
            Cashier.finishRequest(request, upiTxID).then(result => {
                console.log(result);
                console.info('Completed token-to-cash request:', vectorClock);
                notify("Completed request", 'success');
            }).catch(error => console.error(error))
        })
    }).catch(error => {
        notify(error, 'error');
        if (Array.isArray(error) && error[0] === true && typeof error[1] === 'string')
            Cashier.rejectRequest(request, error[1]).then(result => {
                console.log(result);
                console.info('Rejected token-to-cash request:', vectorClock);
            }).catch(error => console.error(error))
    })
}

function getFloIdTitle(floID) {
    return floGlobals.savedIds[floID] ? floGlobals.savedIds[floID].title : floID;
}

function formatAmount(amount = 0) {
    if (!amount)
        return '₹0.00';
    return amount.toLocaleString(`en-IN`, { style: 'currency', currency: 'INR' })
}

function getStatusIcon(status) {
    switch (status) {
        case 'PENDING':
            return '<i class="fas fa-clock"></i>';
        case 'COMPLETED':
            return '<i class="fas fa-check"></i>';
        case 'REJECTED':
            return '<i class="fas fa-times"></i>';
        default:
            break;
    }
}

const cashierRejectionErrors = {
    1001: `Your request was reject because of wrong transaction ID. If you have sent money, it'll be returned within 24 hrs.`,
    1002: `Amount requested and amount sent via UPI doesn't match. your transferred money will be returned within 24hrs.`,
    1003: `Your request was rejected because of wrong or missing remark/message code. If you have sent money, it'll be returned within 24 hrs.`,
    1004: `Your request was rejected because specified amount wasn't received by the cashier.`,
}

const render = {
    savedId(floID, details) {
        const { title } = details;
        const clone = getRef('saved_id_template').content.cloneNode(true).firstElementChild;
        clone.dataset.floId = floID;
        clone.querySelector('.saved-id__initials').textContent = title.charAt(0);
        clone.querySelector('.saved-id__title').textContent = title;
        clone.querySelector('.saved-id__flo-id').textContent = floID;
        return clone;
    },
    transactionCard(transactionDetails) {
        const { txid, time, sender, receiver, tokenAmount } = transactionDetails;
        const clone = getRef('transaction_template').content.cloneNode(true).firstElementChild;
        clone.dataset.txid = txid;
        clone.querySelector('.transaction__time').textContent = getFormattedTime(time * 1000);
        clone.querySelector('.transaction__amount').textContent = formatAmount(tokenAmount);
        if (sender === myFloID) {
            clone.classList.add('sent');
            clone.querySelector('.transaction__receiver').textContent = `Sent to ${getFloIdTitle(receiver) || 'Myself'}`;
            clone.querySelector('.transaction__icon').innerHTML = `<svg class="icon sent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>`;
        } else if (receiver === myFloID) {
            clone.classList.add('received');
            clone.querySelector('.transaction__receiver').textContent = `Received from ${getFloIdTitle(sender)}`;
            clone.querySelector('.transaction__icon').innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>`;
        } else { //This should not happen unless API returns transaction that does not involve myFloID
            row.insertCell().textContent = tx.sender;
            row.insertCell().textContent = tx.receiver;
        }
        return clone;
    },
    cashierRequestCard(details) {
        const { time, senderID, message: { mode, amount = 0 }, note, tag, vectorClock } = details;
        const clone = getRef('cashier_request_template').content.cloneNode(true).firstElementChild;
        clone.dataset.vc = vectorClock;
        const status = tag || note; //status tag for completed, note for rejected
        clone.querySelector('.cashier-request__details').textContent = `${mode === 'cash-to-token' ? 'Top-up wallet with' : 'Withdraw'} ${formatAmount(amount)}`;
        clone.querySelector('.cashier-request__requestor').textContent = senderID;
        clone.querySelector('.cashier-request__time').textContent = getFormattedTime(time);
        clone.querySelector('.cashier-request__mode').innerHTML = mode === 'token-to-cash' ? `<svg class="icon" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"> <g> <rect fill="none" height="24" width="24"></rect> </g> <g> <g> <rect height="7" width="3" x="4" y="10"></rect> <rect height="7" width="3" x="10.5" y="10"></rect> <rect height="3" width="20" x="2" y="19"></rect> <rect height="7" width="3" x="17" y="10"></rect> <polygon points="12,1 2,6 2,8 22,8 22,6"></polygon> </g> </g> </svg>`
            :
            `<svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"></path><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>`;
        if (status)
            clone.querySelector('.cashier-request__status').textContent = status.includes(':') ? status.split(':')[0] : status;
        else
            clone.querySelector('.cashier-request__status').innerHTML = `<button class="button process-cashier-request">Process</button>`;
        return clone;
    },
    walletRequestCard(details) {
        const { time, message: { mode, amount }, note, tag, vectorClock } = details;
        const clone = getRef('wallet_request_template').content.cloneNode(true).firstElementChild.firstElementChild;
        const type = mode === 'cash-to-token' ? 'Wallet top-up' : 'Withdraw';
        let status = tag ? tag : (note ? 'REJECTED' : "PENDING");
        clone.classList.add(status.toLowerCase());
        clone.classList.add(mode === 'cash-to-token' ? 'added' : 'withdrawn');
        clone.dataset.vc = vectorClock;
        clone.href = `#/transaction?transactionId=${vectorClock}&type=wallet`;
        clone.querySelector('.wallet-request__icon').innerHTML = mode === 'cash-to-token' ?
            `<svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none" /><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>`
            :
            `<svg class="icon" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24" /></g><g><g><rect height="7" width="3" x="4" y="10" /><rect height="7" width="3" x="10.5" y="10" /><rect height="3" width="20" x="2" y="19" /><rect height="7" width="3" x="17" y="10" /><polygon points="12,1 2,6 2,8 22,8 22,6" /></g></g></svg>`;
        clone.querySelector('.wallet-request__details').textContent = type;
        clone.querySelector('.wallet-request__amount').textContent = formatAmount(amount);
        clone.querySelector('.wallet-request__time').textContent = getFormattedTime(time);
        let icon = '';
        if (status === 'REJECTED') {
            icon = `<svg class="icon failed" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
            clone.querySelector('.wallet-request__status').innerHTML = `Failed ${icon}`;
        }
        return clone;
    },
    paymentRequestCard(details) {
        const { time, senderID, message: { amount, remark }, note, vectorClock } = details;
        const clone = getRef(`${note ? 'processed' : 'pending'}_payment_request_template`).content.cloneNode(true).firstElementChild;
        clone.dataset.vc = vectorClock;
        clone.querySelector('.payment-request__requestor').textContent = getFloIdTitle(senderID);
        clone.querySelector('.payment-request__remark').textContent = remark;
        clone.querySelector('.payment-request__time').textContent = getFormattedTime(time);
        clone.querySelector('.payment-request__amount').textContent = amount.toLocaleString(`en-IN`, { style: 'currency', currency: 'INR' });
        const status = note ? note.split(':')[0] : 'PENDING';
        if (note) {
            clone.firstElementChild.href = `#/transaction?transactionId=${vectorClock}&type=request`;
            let icon
            if (status === 'PAID')
                icon = `<svg class="icon paid" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z"/></g></svg>`
            else
                icon = `<svg class="icon declined" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg>`
            clone.querySelector('.payment-request__status').innerHTML = `${status.toLowerCase()} ${icon}`;
        }
        return clone;
    },
    transactionMessage(details) {
        const { tokenAmount, time, sender, receiver, flodata } = floTokenAPI.util.parseTxData(details)
        let messageType = sender === receiver ? 'self' : sender === myFloID ? 'sent' : 'received';
        const clone = getRef('transaction_message_template').content.cloneNode(true).firstElementChild;
        clone.classList.add(messageType);
        clone.querySelector('.transaction-message__amount').textContent = formatAmount(tokenAmount);
        if (flodata.split('|')[1]) {
            clone.querySelector('.transaction-message__remark').textContent = flodata.split('|')[1];
        }
        clone.querySelector('.transaction-message__time').textContent = getFormattedTime(time * 1000);
        return clone;
    },
    savedUpiId(upiId) {
        const clone = getRef('saved_upi_template').content.cloneNode(true).firstElementChild;
        clone.dataset.upiId = upiId;
        clone.querySelector('.saved-upi__id').textContent = upiId;
        return clone;
    },
    savedIdPickerCard(floID, { title }) {
        return createElement('li', {
            className: 'saved-id grid interact',
            attributes: { 'tabindex': '0', 'data-flo-id': floID },
            innerHTML: `
                            <div class="saved-id__initials">${title[0]}</div>
                            <div class="grid gap-0-5">
                                <h4 class="saved-id__title">${title}</h4>
                                <div class="saved-id__flo-id overflow-ellipsis">${floID}</div>
                            </div>
                            `
        })
    },
    savedUpiIdOption(upiId) {
        return createElement('sm-option', {
            textContent: upiId,
            attributes: {
                value: upiId,
            }
        })
    },
    paymentsHistory() {
        let paymentTransactions = []
        if (paymentsHistoryLoader)
            paymentsHistoryLoader.clear()
        getRef('payments_history').innerHTML = '<sm-spinner></sm-spinner>';
        floTokenAPI.getAllTxs(myFloID).then(({ transactions }) => {
            for (const transactionId in transactions) {
                paymentTransactions.push({
                    ...floTokenAPI.util.parseTxData(transactions[transactionId]),
                    txid: transactionId
                })
            }
            const filter = getRef('payments_type_filter').querySelector('input:checked').value;
            if (filter !== 'all') {
                let propToCheck = filter === 'sent' ? 'sender' : 'receiver';
                paymentTransactions = paymentTransactions.filter(v => v[propToCheck] === myFloID)
            }
            // solve sorting issue at backend
            paymentTransactions.sort((a, b) => b.time - a.time);
            if (paymentsHistoryLoader) {
                paymentsHistoryLoader.update(paymentTransactions);
            } else {
                paymentsHistoryLoader = new LazyLoader('#payments_history', paymentTransactions, render.transactionCard);
            }
            paymentsHistoryLoader.init();
        }).catch(e => {
            console.error(e)
        })
    },
    async savedIds() {
        const frag = document.createDocumentFragment();
        await organizeSyncedData('savedIds');
        getArrayOfSavedIds().forEach(({ floID, details }) => {
            frag.append(render.savedId(floID, details));
        })
        getRef('saved_ids_list').append(frag);
    }
};

function buttonLoader(id, show) {
    const button = typeof id === 'string' ? getRef(id) : id;
    button.disabled = show;
    const animOptions = {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
    }
    if (show) {
        button.animate([
            {
                clipPath: 'circle(100%)',
            },
            {
                clipPath: 'circle(0)',
            },
        ], animOptions).onfinish = e => {
            e.target.commitStyles()
            e.target.cancel()
        }
        button.parentNode.append(createElement('sm-spinner'))
    } else {
        button.style = ''
        const potentialTarget = button.parentNode.querySelector('sm-spinner')
        if (potentialTarget) potentialTarget.remove();
    }
}
async function refreshBalance(button) {
    if (button)
        buttonLoader(button, true)
    floTokenAPI.getBalance(myFloID).then((balance = 0) => {
        const [beforeDecimal, afterDecimal] = formatAmount(balance).split('₹')[1].split('.')
        renderElem(getRef('rupee_balance'), html`<span><b>${beforeDecimal}</b></span>.<span>${afterDecimal}</span>`)
        if (button)
            buttonLoader(button, false)
    })
    try {
        const [floBal, floRates] = await Promise.all([floBlockchainAPI.getBalance(myFloID), floExchangeAPI.getRates('FLO')])
        const [beforeDecimal, afterDecimal = '00'] = String(floBal).split('.')
        renderElem(getRef('flo_balance'), html`<span><b>${beforeDecimal}</b></span>.<span>${afterDecimal}</span>`)
        if (floBal < floGlobals.settings.user_flo_threshold) {
            getRef('low_user_flo_warning').textContent = `Your FLO balance is low. You will receive ${floGlobals.settings.send_user_flo} FLO of worth ₹${parseFloat(floRates.rate.toFixed(2))} deducted from top-up amount.`;
            getRef('low_user_flo_warning').classList.remove('hide');
        } else {
            getRef('low_user_flo_warning').classList.add('hide');
        }
        if (button)
            buttonLoader(button, false)
    } catch (e) {
        console.error(e)
    }
}

function getArrayOfSavedIds() {
    const arr = [];
    for (const key in floGlobals.savedIds) {
        arr.push({
            floID: key,
            details: floGlobals.savedIds[key]
        });
    }
    return arr.sort((a, b) => a.details.title.localeCompare(b.details.title));
}
async function saveFloId() {
    const floID = getRef('flo_id_to_save').value.trim();
    if (floGlobals.savedIds.hasOwnProperty(floID))
        return notify('This FLO ID is already saved', 'error');
    const title = getRef('flo_id_title_to_save').value.trim();
    floGlobals.savedIds[floID] = { title }
    buttonLoader('save_flo_id_button', true);
    syncUserData('savedIds', floGlobals.savedIds).then(() => {
        insertElementAlphabetically(title, render.savedId(floID, { title }))
        notify(`Saved ${floID}`, 'success');
        closePopup();
    }).catch(error => {
        notify(error, 'error');
    }).finally(() => {
        buttonLoader('save_flo_id_button', false);
    })
}
delegate(getRef('saved_ids_list'), 'click', '.saved-id', e => {
    if (e.target.closest('.edit-saved')) {
        const target = e.target.closest('.saved-id');
        getRef('edit_saved_id').setAttribute('value', target.dataset.floId);
        getRef('get_new_title').value = getFloIdTitle(target.dataset.floId);
        openPopup('edit_saved_popup');
    } else if (e.target.closest('.copy-saved-id')) {
        const target = e.target.closest('.saved-id');
        navigator.clipboard.writeText(target.dataset.floId)
        target.dispatchEvent(
            new CustomEvent('copy', {
                bubbles: true,
                cancelable: true,
            })
        );
    } else {
        const target = e.target.closest('.saved-id');
        window.location.hash = `#/contact?floId=${target.dataset.floId}`;
    }
});
function saveIdChanges() {
    const floID = getRef('edit_saved_id').value;
    let title = getRef('get_new_title').value.trim();
    if (title == '')
        title = 'Unknown';
    floGlobals.savedIds[floID] = { title }
    syncUserData('savedIds', floGlobals.savedIds).then(() => {
        const potentialTarget = getRef('saved_ids_list').querySelector(`.saved-id[data-flo-id="${floID}"]`)
        if (potentialTarget) {
            potentialTarget.querySelector('.saved-id__title').textContent = title;
            potentialTarget.querySelector('.saved-id__initials').textContent = title.charAt(0).toUpperCase();
            // place the renamed card in alphabetically correct position
            const clone = potentialTarget.cloneNode(true);
            potentialTarget.remove();
            insertElementAlphabetically(title, clone)
        }
        closePopup();
    }).catch(error => {
        notify(error, 'error');
    })
}
function deleteSavedId() {
    getConfirmation('Do you want delete this FLO ID?', {
        confirmText: 'Delete',
    }).then(res => {
        if (res) {
            const toDelete = getRef('saved_ids_list').querySelector(`.saved-id[data-flo-id="${getRef('edit_saved_id').value}"]`);
            if (toDelete)
                toDelete.remove();
            delete floGlobals.savedIds[getRef('edit_saved_id').value];
            closePopup();
            syncUserData('savedIds', floGlobals.savedIds).then(() => {
                notify(`Deleted saved ID`, 'success');
            }).catch(error => {
                notify(error, 'error');
            });
        }
    });
}
const savedIdsObserver = new MutationObserver((mutationList) => {
    mutationList.forEach(mutation => {
        getRef('saved_ids_tip').textContent = mutation.target.children.length === 0 ? `Click 'Add FLO ID' to add a new FLO ID.` : `Tap on saved IDs to see transaction history.`
    })
})

savedIdsObserver.observe(getRef('saved_ids_list'), {
    childList: true,
})
function insertElementAlphabetically(name, elementToInsert) {
    const elementInserted = [...getRef('saved_ids_list').children].some(child => {
        const floID = child.dataset.floId;
        if (floGlobals.savedIds[floID].title.localeCompare(name) > 0) {
            child.before(elementToInsert)
            return true
        }
    })
    if (!elementInserted) {
        getRef('saved_ids_list').append(elementToInsert)
    }
}

getRef('search_saved_ids_picker').addEventListener('input', debounce(async e => {
    const frag = document.createDocumentFragment()
    const searchKey = e.target.value.trim();
    let allSavedIds = getArrayOfSavedIds();
    if (searchKey !== '') {
        const fuse = new Fuse(allSavedIds, { keys: ['floID', 'details.title'] })
        allSavedIds = fuse.search(searchKey).map(v => v.item)
    }
    allSavedIds.forEach(({ floID, details }) => {
        frag.append(render.savedIdPickerCard(floID, details))
    })
    getRef('saved_ids_picker_list').innerHTML = '';
    getRef('saved_ids_picker_list').append(frag);
    if (searchKey !== '') {
        const potentialTarget = getRef('saved_ids_picker_list').firstElementChild
        if (potentialTarget) {
            potentialTarget.classList.add('highlight')
        }
    }
}, 100))
getRef('search_saved_ids_picker').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const potentialTarget = getRef('saved_ids_picker_list').firstElementChild
        if (potentialTarget) {
            potentialTarget.click()
        }
    }
})
delegate(getRef('saved_ids_picker_list'), 'click', '.saved-id', e => {
    getRef('token_transfer__receiver').value = e.delegateTarget.dataset.floId
    getRef('token_transfer__receiver').focusIn()
    closePopup()
})

let currentUserAction;
function showTokenTransfer(type) {
    getRef('token_transfer__button').textContent = type;
    currentUserAction = type;
    if (type === 'send') {
        getRef('token_transfer__title').textContent = 'Send money to FLO ID';
    } else {
        getRef('token_transfer__title').textContent = 'Request money from FLO ID';
    }
    if (pagesData.lastPage === 'contact') {
        getRef('token_transfer__receiver').value = pagesData.params.floId;
        getRef('token_transfer__receiver').readOnly = true;
        getRef('token_transfer__receiver').querySelector('button').classList.add('hide');
    } else {
        getRef('token_transfer__receiver').readOnly = false;
        getRef('token_transfer__receiver').querySelector('button').classList.remove('hide');
    }
    openPopup('token_transfer_popup');
    if (pagesData.lastPage === 'contact') {
        getRef('token_transfer__amount').focusIn();
    }
}


userUI.sendMoneyToUser = function (floID, amount, remark) {
    getConfirmation('Confirm', { message: `Do you want to send ${amount} to ${getFloIdTitle(floID)}?`, confirmText: 'send' }).then(confirmation => {
        if (confirmation) {
            buttonLoader('token_transfer__button', true);
            User.sendToken(floID, amount, "|" + remark).then(txid => {
                console.warn(`Sent ${amount} to ${floID}`, txid);
                notify(`Sent ${amount} to ${getFloIdTitle(floID)}. It may take a few mins to reflect in their wallet`, 'success');
                closePopup()
            }).catch(error => notify(error, 'error'))
                .finally(() => {
                    buttonLoader('token_transfer__button', false);
                })
        }
    })
}

userUI.requestMoneyFromUser = function (floID, amount, remark) {
    getConfirmation('Confirm', { message: `Do you want to request ${amount} from ${getFloIdTitle(floID)}?`, confirmText: 'request' }).then(confirmation => {
        if (confirmation) {
            buttonLoader('token_transfer__button', true);
            User.requestToken(floID, amount, remark).then(result => {
                console.log(`Requested ${amount} from ${floID}`, result);
                notify(`Requested ${amount} from ${getFloIdTitle(floID)}`, 'success');
                closePopup()
            }).catch(error => notify(error, 'error'))
                .finally(() => {
                    buttonLoader('token_transfer__button', false);
                })
        }
    })
}
function executeUserAction() {
    const floID = getRef('token_transfer__receiver').value.trim(),
        amount = parseFloat(getRef('token_transfer__amount').value),
        remark = getRef('token_transfer__remark').value.trim();
    if (currentUserAction === 'send') {
        userUI.sendMoneyToUser(floID, amount, remark);
    } else {
        userUI.requestMoneyFromUser(floID, amount, remark);
    }
}

function toggleFilters() {
    const animOptions = {
        duration: 200,
        easing: 'ease',
        fill: 'forwards',
    }
    if (getRef('history_applied_filters_wrapper').classList.contains('hide') && getRef('history_applied_filters').children.length > 0) {
        getRef('history_applied_filters_wrapper').classList.remove('hide')
        const filtersContainerDimensions = getRef('history_applied_filters_wrapper').getBoundingClientRect();
        getRef('history_applied_filters_wrapper').animate([
            {
                transform: `translateY(-1.5rem)`,
                opacity: 0
            },
            {
                transform: `translateY(0)`,
                opacity: 1
            },
        ], animOptions)
        getRef('payments_history').animate([
            { transform: `translateY(-${filtersContainerDimensions.height}px)` },
            { transform: `translateY(0)` },
        ], animOptions)
    } else if (!getRef('history_applied_filters_wrapper').classList.contains('hide') && getRef('history_applied_filters').children.length === 0) {
        getRef('history_applied_filters_wrapper').animate([
            {
                transform: `translateY(0)`,
                opacity: 1
            },
            {
                transform: `translateY(-1.5rem)`,
                opacity: 0
            },
        ], animOptions)
            .onfinish = () => {
                getRef('history_applied_filters_wrapper').classList.add('hide')
            }
        const filtersContainerDimensions = getRef('history_applied_filters_wrapper').getBoundingClientRect();
        const historyDimensions = getRef('payments_history').getBoundingClientRect();
        getRef('payments_history').animate([
            { transform: `translateY(0)` },
            { transform: `translateY(-${historyDimensions.top - filtersContainerDimensions.top}px)` },
        ], animOptions).onfinish = (e) => {
            e.target.commitStyles()
            e.target.cancel()
            getRef('payments_history').style.transform = '';
        }
        getRef('payments_type_filter').querySelector('input[value="all"]').checked = true;
    }
}

function applyPaymentsFilters() {
    const filter = getRef('payments_type_filter').querySelector('input:checked').value;
    getRef('history_applied_filters').innerHTML = ``;
    if (filter !== 'all') {
        renderElem(getRef('history_applied_filters'),
            html`
            <button class="applied-filter" data-filter="type" data-value=${filter} title="Remove filter">
                <span class="applied-filter__title">${filter}</span>
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none"  />
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"  />
                    </svg>
            </button>`);
    }
    toggleFilters()
    render.paymentsHistory()
    closePopup()
}
function resetPaymentsFilters() {
    getRef('payments_type_filter').querySelector('input[value="all"]').checked = true;
    render.paymentsHistory()
    closePopup()
    toggleFilters()
}

delegate(getRef('history_applied_filters'), 'click', '.applied-filter', e => {
    const filter = e.delegateTarget.dataset.filter
    const filterValue = e.delegateTarget.dataset.value
    e.delegateTarget.remove()
    render.paymentsHistory()
    toggleFilters()
})

function changeUpi() {
    const upiId = getRef('upi_id').value.trim();
    Cashier.updateUPI(upiId).then(() => {
        getRef('my_upi_id').classList.remove('hide')
        getRef('my_upi_id').value = upiId;
        getRef('change_upi_button').textContent = 'Change UPI ID';
        notify('UPI ID updated successfully', 'success');
        closePopup()
    }).catch(err => {
        notify(err, 'error');
    });
}
function getSignedIn() {
    return new Promise((resolve, reject) => {
        if (window.location.hash.includes('sign_in') || window.location.hash.includes('sign_up')) {
            showPage(window.location.hash);
        } else {
            location.hash = `#/sign_in`;
        }
        getRef('sign_in_button').onclick = () => {
            resolve(getRef('private_key_field').value.trim());
            getRef('private_key_field').value = '';
            showPage('loading');
        };
        getRef('sign_up_button').onclick = () => {
            resolve(getRef('generated_private_key').value.trim());
            getRef('generated_private_key').value = '';
            showPage('loading');
        };
    });
}
function signOut() {
    getConfirmation('Sign out?', 'You are about to sign out of the app, continue?', 'Stay', 'Leave')
        .then(async (res) => {
            if (res) {
                await floDapps.clearCredentials();
                location.reload();
            }
        });
}
    