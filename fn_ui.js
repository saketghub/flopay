const userUI = {};

userUI.requestTokenFromCashier = function() {
    let cashier = User.findCashier();
    if (!cashier)
        return alert("No cashier online");
    let amount = parseFloat(document.forms['request-cashier']['amount'].value);
    //get UPI txid from user
    let upiTxID = prompt(`Send Rs. ${amount} to ${cashierUPI[cashier]} and enter UPI txid`);
    if (!upiTxID)
        return alert("Cancelled");
    User.cashToToken(cashier, amount, upiTxID).then(result => {
        console.log(result);
        alert("Requested cashier. please wait!");
    }).catch(error => console.error(error))
}

userUI.withdrawCashFromCashier = function() {
    let cashier = User.findCashier();
    if (!cashier)
        return alert("No cashier online");
    let amount = parseFloat(document.forms['request-cashier']['amount'].value);
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

userUI.sendMoneyToUser = function() {
    let form = document.forms['user-money'];
    let floID = form['flo-id'].value,
        amount = parseFloat(form['amount'].value),
        remark = form['remark'].value;
    let confirmation = confirm(`Do you want to SEND ${amount} to ${floID}?`);
    if (!confirmation)
        return alert("Cancelled");
    User.sendToken(floID, amount, "|" + remark).then(txid => {
        console.warn(`Sent ${amount} to ${floID}`, txid);
        alert(`Sent ${amount} to ${floID}. It may take a few mins to reflect in their wallet`);
    }).catch(error => console.error(error));
}

userUI.requestMoneyFromUser = function() {
    let form = document.forms['user-money'];
    let floID = form['flo-id'].value,
        amount = parseFloat(form['amount'].value),
        remark = form['remark'].value;
    let confirmation = confirm(`Do you want to REQUEST ${amount} from ${floID}?`);
    if (!confirmation)
        return alert("Cancelled");
    User.requestToken(floID, amount, remark).then(result => {
        console.log(`Requested ${amount} from ${floID}`, result);
        alert(`Requested ${amount} from ${floID}`);
    }).catch(error => console.error(error));
}

userUI.renderCashierRequests = function(requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    let table = document.getElementById('user-cashier-requests').getElementsByTagName('tbody')[0];
    for (let r in requests) {
        let oldCard = document.getElementById(r);
        if (oldCard) oldCard.remove();
        let row = table.insertRow();
        renderUser_cashierRequestCard(requests[r], row);
    }
}

function renderUser_cashierRequestCard(request, row) {
    row.id = request.vectorClock;
    row.insertCell().textContent = request.time;
    row.insertCell().textContent = request.receiverID;
    row.insertCell().textContent = request.message.mode;
    let status = request.tag ? (request.tag + ":" + request.note) : (request.note || "PENDING");
    row.insertCell().textContent = status; //Status
}

userUI.renderMoneyRequests = function(requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    let table = document.getElementById('user-money-requests').getElementsByTagName('tbody')[0];
    for (let r in requests) {
        let oldCard = document.getElementById(r);
        if (oldCard) oldCard.remove();
        let row = table.insertRow();
        renderUser_moneyRequestCard(requests[r], row);
    }
}

function renderUser_moneyRequestCard(request, row) {
    row.id = request.vectorClock;
    row.insertCell().textContent = request.time;
    row.insertCell().textContent = request.senderID;
    row.insertCell().textContent = request.message.amount;
    row.insertCell().textContent = request.message.remark;
    let status = request.note;
    if (status)
        row.insertCell().textContent = request.note;
    else
        row.insertCell().innerHTML =
        `<input type="button" value="Accept" onclick="userUI.payRequest('${request.vectorClock}')" />` +
        `<input type="button" value="Decline" onclick="userUI.declineRequest('${request.vectorClock}')" />`;
}

userUI.payRequest = function(reqID) {
    let request = User.moneyRequests[reqID];
    let confirmation = confirm(`Do you want to SEND ${request.message.amount} to ${request.senderID}?`);
    if (!confirmation)
        return alert("Cancelled");
    User.sendToken(request.senderID, request.message.amount, "|" + request.message.remark).then(txid => {
        console.warn(`Sent ${request.message.amount} to ${request.senderID}`, txid);
        alert(`Sent ${request.message.amount} to ${request.senderID}. It may take a few mins to reflect in their wallet`);
        User.decideRequest(request, 'PAID: ' + txid)
            .then(result => console.log(result))
            .catch(error => console.error(error))
    }).catch(error => console.error(error));
}

userUI.declineRequest = function(reqID) {
    let request = User.moneyRequests[reqID];
    User.decideRequest(request, "DECLINED").then(result => {
        console.log(result);
        alert("Declined request");
    }).catch(error => console.error(error))
}

//Cashier
const cashierUI = {};

cashierUI.renderRequests = function(requests, error = null) {
    if (error)
        return console.error(error);
    else if (typeof requests !== "object" || requests === null)
        return;
    let table = document.getElementById('cashier-request-list').getElementsByTagName('tbody')[0];
    for (let r in requests) {
        let oldCard = document.getElementById(r);
        if (oldCard) oldCard.remove();
        let row = table.insertRow();
        renderCashier_requestCard(requests[r], row);
    }
}

function renderCashier_requestCard(request, row) {
    row.id = request.vectorClock;
    row.insertCell().textContent = request.senderID;
    row.insertCell().textContent = request.time;
    row.insertCell().textContent = request.message.mode;
    let status = request.tag || request.note; //status tag for completed, note for rejected
    if (status)
        row.insertCell().textContent = status;
    else
        row.insertCell().innerHTML = `<input type="button" value="PENDING" onclick="cashierUI.completeRequest('${request.vectorClock}')" />`
}

cashierUI.completeRequest = function(reqID) {
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
    let table = document.getElementById('token-transactions').getElementsByTagName('tbody')[0];
    tokenAPI.getAllTxs(myFloID).then(result => {
        for (let txid in result.transactions) {
            let row = table.insertRow();
            renderTransactionCard(row, txid, tokenAPI.util.parseTxData(result.transactions[txid]));
        }
    }).catch(error => console.error(error))
}

function renderTransactionCard(row, txid, tx) {
    row.setAttribute('title', txid);
    row.insertCell().textContent = tx.time;
    if (tx.sender === myFloID) {
        row.insertCell().textContent = 'Sent';
        row.insertCell().textContent = tx.receiver || 'Myself';
    } else if (tx.receiver === myFloID) {
        row.insertCell().textContent = 'Recieved';
        row.insertCell().textContent = tx.sender;
    } else { //This should not happen unless API returns transaction that doesnot involve myFloID
        row.insertCell().textContent = tx.sender;
        row.insertCell().textContent = tx.receiver;
    }
    row.insertCell().textContent = tx.tokenAmount;
}