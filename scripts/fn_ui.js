/*jshint esversion: 6 */
const userUI = {};

userUI.requestTokenFromCashier = function () {
    let cashier = User.findCashier();
    if (!cashier)
        return alert("No cashier online");
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
        return alert("No cashier online");
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
    const frag = document.createDocumentFragment()
    for (let r in requests) {
        let oldCard = document.getElementById(r);
        if (oldCard) oldCard.remove();
        frag.append(render.walletRequestCard(requests[r]))
    }
    getRef('user-cashier-requests').append(frag)
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

function renderAllTokenTransactions() {
    tokenAPI.getAllTxs(myFloID).then(result => {
        getRef('token_transactions').innerHTML = ''
        const frag = document.createDocumentFragment();
        for (let txid in result.transactions) {
            frag.append(render.transactionCard(txid, tokenAPI.util.parseTxData(result.transactions[txid])))
        }
        getRef('token_transactions').append(frag)
    }).catch(error => console.error(error))
}

const render = {
    transactionCard(txid, transactionDetails) {
        const { time, sender, receiver, tokenAmount } = transactionDetails
        const clone = getRef('transaction_template').content.cloneNode(true).firstElementChild;
        clone.dataset.txid = txid
        clone.querySelector('.transaction__time').textContent = getFormattedTime(time * 1000)
        clone.querySelector('.transaction__amount').textContent = tokenAmount
        if (sender === myFloID) {
            clone.querySelector('.transaction__amount').classList.add('sent')
            clone.querySelector('.transaction__receiver').textContent = `Sent to ${receiver || 'Myself'}`
            clone.querySelector('.transaction__icon').innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/></svg>`
        } else if (receiver === myFloID) {
            clone.querySelector('.transaction__amount').classList.add('received')
            clone.querySelector('.transaction__receiver').textContent = `Received from ${sender}`
            clone.querySelector('.transaction__icon').innerHTML = `<svg class="icon xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z"/></svg>`
        } else { //This should not happen unless API returns transaction that does not involve myFloID
            row.insertCell().textContent = tx.sender;
            row.insertCell().textContent = tx.receiver;
        }
        return clone
    },
    cashierRequestCard(details) {
        const { time, senderID, message: { mode }, note, tag, vectorClock } = details;
        const clone = getRef('cashier_request_template').content.cloneNode(true).firstElementChild;
        clone.id = vectorClock
        const status = tag || note; //status tag for completed, note for rejected
        clone.querySelector('.cashier-request__requestor').textContent = senderID
        clone.querySelector('.cashier-request__time').textContent = getFormattedTime(time)
        clone.querySelector('.cashier-request__mode').textContent = mode
        if (status)
            clone.querySelector('.cashier-request__status').textContent = status
        else
            clone.querySelector('.cashier-request__status').innerHTML = `<button class="button" onclick="cashierUI.completeRequest('${vectorClock}')">Process</button>`
        return clone
    },
    walletRequestCard(details) {
        const { time, receiverID, message: { mode }, note, tag, vectorClock } = details;
        const clone = getRef('wallet_request_template').content.cloneNode(true).firstElementChild;
        clone.id = vectorClock
        clone.querySelector('.wallet-request__requestor').textContent = receiverID
        clone.querySelector('.wallet-request__time').textContent = getFormattedTime(time)
        clone.querySelector('.wallet-request__mode').textContent = mode === 'cash-to-token' ? 'Deposit' : 'Withdraw'
        let status = tag ? (tag + ":" + note) : (note || "PENDING");
        clone.querySelector('.wallet-request__status').textContent = status
        return clone
    },
    paymentRequestCard(details) {
        const { time, senderID, message: { amount, remark }, note, vectorClock } = details;
        const clone = getRef('payment_request_template').content.cloneNode(true).firstElementChild;
        clone.id = vectorClock
        clone.querySelector('.payment-request__requestor').textContent = senderID
        clone.querySelector('.payment-request__time').textContent = getFormattedTime(time)
        clone.querySelector('.payment-request__amount').textContent = amount.toLocaleString(`en-IN`, { style: 'currency', currency: 'INR' })
        clone.querySelector('.payment-request__remark').textContent = remark

        let status = note;
        if (status)
            clone.querySelector('.payment-request__actions').textContent = note;
        else
            clone.querySelector('.payment-request__actions').innerHTML =
                `<button class="button" onclick="userUI.payRequest('${vectorClock}')">Pay</button>
                <button class="button" onclick="userUI.declineRequest('${vectorClock}')">Decline</button>`;

        return clone
    },
}

let currentUserAction
function showTokenTransfer(type) {
    getRef('tt_button').textContent = type;
    currentUserAction = type
    if (type === 'send') {
        getRef('token_transfer__title').textContent = 'Send money to FLO ID';
    } else {
        getRef('token_transfer__title').textContent = 'Request money from FLO ID';
    }
    showPopup('token_transfer_popup')
}

function executeUserAction() {
    const floID = getRef('tt_flo_id').value.trim(),
        amount = parseFloat(getRef('tt_amount').value),
        remark = getRef('tt_remark').value.trim();
    if (currentUserAction === 'send') {
        userUI.sendMoneyToUser(floID, amount, remark)

    } else {
        userUI.requestMoneyFromUser(floID, amount, remark)
    }
}

function signOut() {
    getConfirmation('Sign out?', 'You are about to sign out of the app, continue?', 'Stay', 'Leave')
        .then(async (res) => {
            if (res) {
                await floDapps.clearCredentials()
                location.reload()
            }
        })
}