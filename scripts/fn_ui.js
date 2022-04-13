/*jshint esversion: 8 */
const userUI = {};
let paymentsHistoryLoader
let walletHistoryLoader

userUI.requestTokenFromCashier = function () {
    let cashier = User.findCashier();
    if (!cashier)
        return notify("No cashier online", 'error');
    let amount = parseFloat(getRef('request_cashier_amount').value.trim());
    //get UPI txid from user
    let upiTxID = prompt(`Send Rs. ${amount} to ${cashierUPI[cashier]} and enter UPI txid`);
    if (!upiTxID)
        return alert("Cancelled");
    User.cashToToken(cashier, amount, upiTxID).then(result => {
        console.log(result);
        alert("Requested cashier. please wait!");
    }).catch(error => console.error(error))
}

userUI.withdrawCashFromCashier = function () {
    let cashier = User.findCashier();
    if (!cashier)
        return notify("No cashier online", 'error');
    let amount = parseFloat(getRef('request_cashier_amount').value.trim());
    //get confirmation from user
    let upiID = prompt(`${amount} ${floGlobals.currency}# will be sent to ${cashier}. Enter UPI ID`);
    if (!upiID)
        return alert("Cancelled");
    User.sendToken(cashier, amount, 'for token-to-cash').then(txid => {
        console.warn(`Withdraw ${amount} from cashier ${cashier}`, txid);
        User.tokenToCash(cashier, amount, txid, upiID).then(result => {
            console.log(result);
            alert("Requested cashier. please wait!");
        }).catch(error => console.error(error))
    }).catch(error => console.error(error))
}

userUI.sendMoneyToUser = function (floID, amount, remark) {
    getConfirmation('Confirm', { message: `Do you want to SEND ${amount} to ${floID}?` }).then(confirmation => {
        if (confirmation) {
            User.sendToken(floID, amount, "|" + remark).then(txid => {
                console.warn(`Sent ${amount} to ${floID}`, txid);
                notify(`Sent ${amount} to ${floID}. It may take a few mins to reflect in their wallet`, 'success');
                hidePopup()
            }).catch(error => console.error(error));
        }
    })
}

userUI.requestMoneyFromUser = function (floID, amount, remark) {
    getConfirmation('Confirm', { message: `Do you want to REQUEST ${amount} from ${floID}?` }).then(confirmation => {
        if (confirmation) {
            User.requestToken(floID, amount, remark).then(result => {
                console.log(`Requested ${amount} from ${floID}`, result);
                notify(`Requested ${amount} from ${floID}`, 'success');
                hidePopup()
            }).catch(error => console.error(error));
        }
    })
}

userUI.renderCashierRequests = function (requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    if (pagesData.lastPage === 'history' && pagesData.params.type === 'wallet') {
        const frag = document.createDocumentFragment()
        for (let transactionID in requests) {
            let oldCard = getRef('wallet_history').querySelector(`#${transactionID}`);
            if (oldCard) oldCard.remove();
            frag.append(render.walletRequestCard(transactionID, requests[transactionID]))
        }
        getRef('wallet_history').prepend(frag)
    }
}

userUI.renderMoneyRequests = function (requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    const frag = document.createDocumentFragment()
    for (let r in requests) {
        let oldCard = document.getElementById(r);
        if (oldCard) oldCard.remove();
        frag.append(render.paymentRequestCard(requests[r]))
    }
    getRef('user-money-requests').append(frag)
}

userUI.renderSavedIds = async function () {
    floGlobals.savedIds = {}
    const frag = document.createDocumentFragment()
    const savedIds = await floCloudAPI.requestApplicationData('savedIds', { mostRecent: true, senderIDs: [myFloID], receiverID: myFloID });
    if (savedIds.length && await compactIDB.readData('savedIds', 'lastSyncTime') !== savedIds[0].time) {
        await compactIDB.clearData('savedIds');
        const dataToDecrypt = floCloudAPI.util.decodeMessage(savedIds[0].message)
        const data = JSON.parse(Crypto.AES.decrypt(dataToDecrypt, myPrivKey));
        for (let key in data) {
            floGlobals.savedIds[key] = data[key];
            compactIDB.addData('savedIds', data[key], key);
        }
        compactIDB.addData('savedIds', savedIds[0].time, 'lastSyncTime');
    } else {
        const idsToRender = await compactIDB.readAllData('savedIds');
        for (const key in idsToRender) {
            if (key !== 'lastSyncTime')
                floGlobals.savedIds[key] = idsToRender[key];
        }
    }
    for (const key in floGlobals.savedIds) {
        frag.append(render.savedId(key, floGlobals.savedIds[key]));
    }
    getRef('saved_ids_list').append(frag);
}

userUI.payRequest = function (reqID) {
    let request = User.moneyRequests[reqID];
    getConfirmation('Pay?', { message: `Do you want to pay ${request.message.amount} to ${request.senderID}?` }).then(confirmation => {
        if (confirmation) {
            User.sendToken(request.senderID, request.message.amount, "|" + request.message.remark).then(txid => {
                console.warn(`Sent ${request.message.amount} to ${request.senderID}`, txid);
                notify(`Sent ${request.message.amount} to ${request.senderID}. It may take a few mins to reflect in their wallet`, 'success');
                User.decideRequest(request, 'PAID: ' + txid)
                    .then(result => console.log(result))
                    .catch(error => console.error(error))
            }).catch(error => console.error(error));
        }
    })
}

userUI.declineRequest = function (reqID) {
    let request = User.moneyRequests[reqID];
    getConfirmation('Decline payment?').then(confirmation => {
        if (confirmation) {
            User.decideRequest(request, "DECLINED").then(result => {
                console.log(result);
                notify("Request declined", 'success');
            }).catch(error => console.error(error))
        }
    })
}

//Cashier
const cashierUI = {};

cashierUI.renderRequests = function (requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    const frag = document.createDocumentFragment();
    for (let r in requests) {
        const oldCard = document.getElementById(r);
        if (oldCard) oldCard.remove();
        frag.append(render.cashierRequestCard(requests[r]));
    }
    getRef('cashier_request_list').append(frag)
}

cashierUI.completeRequest = function (reqID) {
    let request = Cashier.Requests[reqID];
    if (request.message.mode === "cash-to-token")
        completeCashToTokenRequest(request);
    else if (request.message.mode === "token-to-cash")
        completeTokenToCashRequest(request);
}

function completeCashToTokenRequest(request) {
    Cashier.checkIfUpiTxIsValid(request.message.upi_txid).then(_ => {
        let confirmation = confirm(`Check if you have received UPI transfer\ntxid:${request.message.upi_txid}\namount:${request.message.amount}`);
        if (!confirmation)
            return alert("Cancelled");
        User.sendToken(request.senderID, request.message.amount, 'for cash-to-token').then(txid => {
            console.warn(`${request.message.amount} cash-to-token for ${request.senderID}`, txid);
            Cashier.finishRequest(request, txid).then(result => {
                console.log(result);
                console.info('Completed cash-to-token request:', request.vectorClock);
                alert("Completed request");
            }).catch(error => console.error(error))
        }).catch(error => console.error(error))
    }).catch(error => {
        console.error(error);
        alert(error);
        if (Array.isArray(error) && error[0] === true && typeof error[1] === 'string')
            Cashier.rejectRequest(request, error[1]).then(result => {
                console.log(result);
                console.info('Rejected cash-to-token request:', request.vectorClock);
            }).catch(error => console.error(error))
    })
}

function completeTokenToCashRequest(request) {
    Cashier.checkIfTokenTxIsValid(request.message.token_txid, request.senderID, request.message.amount).then(result => {
        let upiTxID = prompt(`Token transfer is verified!\n Send ${request.message.amount} to ${request.message.upi_id} and Enter UPI txid`);
        if (!upiTxID)
            return alert("Cancelled");
        Cashier.finishRequest(request, upiTxID).then(result => {
            console.log(result);
            console.info('Completed token-to-cash request:', request.vectorClock);
            alert("Completed request");
        }).catch(error => console.error(error))
    }).catch(error => {
        console.error(error);
        alert(error);
        if (Array.isArray(error) && error[0] === true && typeof error[1] === 'string')
            Cashier.rejectRequest(request, error[1]).then(result => {
                console.log(result);
                console.info('Rejected token-to-cash request:', request.vectorClock);
            }).catch(error => console.error(error))
    })
}

function getFloIdTitle(floID) {
    return floGlobals.savedIds[floID] ? floGlobals.savedIds[floID].title : floID;
}

function formatAmount(amount) {
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

const render = {
    savedId(floID, details) {
        const { title } = details.hasOwnProperty('title') ? details : { title: details };
        const clone = getRef('saved_id_template').content.cloneNode(true).firstElementChild;
        clone.dataset.floId = floID;
        clone.querySelector('.saved-id__initials').textContent = title.charAt(0);
        clone.querySelector('.saved-id__title').textContent = title;
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
        const { time, senderID, message: { mode }, note, tag, vectorClock } = details;
        const clone = getRef('cashier_request_template').content.cloneNode(true).firstElementChild;
        clone.id = vectorClock;
        const status = tag || note; //status tag for completed, note for rejected
        clone.querySelector('.cashier-request__requestor').textContent = senderID;
        clone.querySelector('.cashier-request__time').textContent = getFormattedTime(time);
        clone.querySelector('.cashier-request__mode').textContent = mode;
        if (status)
            clone.querySelector('.cashier-request__status').textContent = status;
        else
            clone.querySelector('.cashier-request__status').innerHTML = `<button class="button" onclick="cashierUI.completeRequest('${vectorClock}')">Process</button>`;
        return clone;
    },
    walletRequestCard(details) {
        const { time, message: { mode, amount }, note, tag, vectorClock } = details;
        const clone = getRef('wallet_request_template').content.cloneNode(true).firstElementChild;
        clone.id = vectorClock;
        clone.querySelector('.wallet-request__details').textContent = `${mode === 'cash-to-token' ? 'Deposit' : 'Withdraw'} ${formatAmount(amount)}`;
        clone.querySelector('.wallet-request__time').textContent = getFormattedTime(time);
        let status = tag ? tag : (note ? 'REJECTED' : "PENDING");
        let icon = '';
        switch (status) {
            case 'COMPLETED':
                clone.children[1].append(
                    createElement('div', {
                        className: 'flex flex-wrap align-center wallet-request__note',
                        innerHTML: `<b>Transaction ID:</b><sm-copy value="${note}"></sm-copy>`
                    })
                );
                icon = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`
                break;
            case 'REJECTED':
                clone.children[1].append(
                    createElement('div', {
                        className: 'wallet-request__note',
                        innerHTML: note.split(':')[1]
                    })
                );
                icon = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`
                break;
            case 'PENDING':
                icon = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2L11,13V7h1.5v5.2l4.5,2.7L16.2,16.2z"/></g></g></g></svg>`
                break;

            default:
                break;
        }
        clone.querySelector('.wallet-request__status').innerHTML = `${icon}${status}`;
        clone.querySelector('.wallet-request__status').classList.add(status.toLowerCase());
        return clone;
    },
    paymentRequestCard(details) {
        const { time, senderID, message: { amount, remark }, note, vectorClock } = details;
        const clone = getRef('payment_request_template').content.cloneNode(true).firstElementChild;
        clone.id = vectorClock;
        clone.querySelector('.payment-request__requestor').textContent = senderID;
        clone.querySelector('.payment-request__time').textContent = getFormattedTime(time);
        clone.querySelector('.payment-request__amount').textContent = amount.toLocaleString(`en-IN`, { style: 'currency', currency: 'INR' });
        clone.querySelector('.payment-request__remark').textContent = remark;

        let status = note;
        if (status)
            clone.querySelector('.payment-request__actions').textContent = note;
        else
            clone.querySelector('.payment-request__actions').innerHTML =
                `<button class="button" onclick="userUI.payRequest('${vectorClock}')">Pay</button>
                <button class="button" onclick="userUI.declineRequest('${vectorClock}')">Decline</button>`;

        return clone;
    }
};

getRef('history_type_selector').addEventListener('change', (e) => {
    location.hash = `#/history?type=${e.target.value}`;
})

let currentUserAction;
function showTokenTransfer(type) {
    getRef('tt_button').textContent = type;
    currentUserAction = type;
    if (type === 'send') {
        getRef('token_transfer__title').textContent = 'Send money to FLO ID';
    } else {
        getRef('token_transfer__title').textContent = 'Request money from FLO ID';
    }
    showPopup('token_transfer_popup');
}

saveId = async function () {
    const floID = getRef('flo_id_to_save').value.trim();
    const title = getRef('flo_id_title_to_save').value.trim();
    floGlobals.savedIds[floID] = { title }
    getRef('saved_ids_list').append(render.savedId(floID, { title }));
    syncSavedIds().then(() => {
        notify(`Saved ${floID}`, 'success');
        hidePopup();
    }).catch(error => {
        notify(error, 'error');
    })
}
function syncSavedIds() {
    const dataToSend = Crypto.AES.encrypt(JSON.stringify(floGlobals.savedIds), myPrivKey);
    return floCloudAPI.sendApplicationData(dataToSend, 'savedIds', { receiverID: myFloID });
}
delegate(getRef('saved_ids_list'), 'click', '.saved-id', e => {
    if (e.target.closest('.edit-saved')) {
        const target = e.target.closest('.saved-id');
        getRef('edit_saved_id').setAttribute('value', target.dataset.floId);
        getRef('newAddrLabel').value = getFloIdTitle(target.dataset.floId);
        showPopup('edit_saved_popup');
    } else {
        const target = e.target.closest('.saved-id');
        window.location.hash = `#/contact?floId=${target.dataset.floId}`;
    }
});
function deleteSaved() {
    getConfirmation('Do you want delete this FLO ID?', {
        confirmText: 'Delete',
    }).then(res => {
        if (res) {
            const toDelete = getRef('saved_ids_list').querySelector(`.saved-id[data-flo-id="${getRef('edit_saved_id').value}"]`);
            if (toDelete)
                toDelete.remove();
            delete floGlobals.savedIds[getRef('edit_saved_id').value];
            hidePopup();
            syncSavedIds().then(() => {
                notify(`Deleted saved ID`, 'success');
            }).catch(error => {
                notify(error, 'error');
            });
        }
    });
}

function executeUserAction() {
    const floID = getRef('tt_flo_id').value.trim(),
        amount = parseFloat(getRef('tt_amount').value),
        remark = getRef('tt_remark').value.trim();
    if (currentUserAction === 'send') {
        userUI.sendMoneyToUser(floID, amount, remark);

    } else {
        userUI.requestMoneyFromUser(floID, amount, remark);
    }
}

function changeUpi() {
    const upiID = getRef('upi_id').value.trim();
    Cashier.updateUPI(upiID).then(() => {
        notify('UPI ID updated successfully', 'success');
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