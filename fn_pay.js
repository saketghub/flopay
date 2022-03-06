const TYPE_MONEY_REQUEST = "MoneyRequests",
    TYPE_CASHIER_REQUEST = "CashierRequests";

const cashierUPI = {};

//https://ranchimallflo.duckdns.org/api/v1.0/getFloAddressTransactions?token=rupee&floAddress=FKAEdnPfjXLHSYwrXQu377ugN4tXU7VGdf
//For regular users
const User = {};
const cashierStatus = {};

User.init = function() {
    return new Promise((resolve, reject) => {
        let promises;
        //Request cashier for token-cash exchange
        promises = floGlobals.subAdmins.map(cashierID => floCloudAPI.requestGeneralData(TYPE_CASHIER_REQUEST, {
            senderID: myFloID,
            receiverID: cashierID,
            group: "Cashiers",
            callback: userUI.renderCashierRequests //UI_fn
        }));
        //Request received from other Users for token
        promises.push(floCloudAPI.requestGeneralData(TYPE_MONEY_REQUEST, {
            receiverID: myFloID,
            callback: userUI.renderMoneyRequests //UI_fn
        }));
        //Check online status of cashiers
        promises.push(floCloudAPI.requestStatus(Array.from(floGlobals.subAdmins), {
            callback: (d, e) => {
                if (e) return console.error(e);
                for (let i in d)
                    cashierStatus[i] = d[i];
                //Add any UI_fn if any
            }
        }))
        /*
        promises.push(floCloudAPI.requestObjectData("UPI", { //Is this needed?
            callback: UI_RENDER_FN
        }));
        */
        Promise.all(promises)
            .then(result => resolve(result))
            .catch(error => reject(error))
    })
}

Object.defineProperty(Cashier, 'cashierRequests', {
    get: function() {
        let fk = floCloudAPI.util.filterKey(TYPE_CASHIER_REQUEST, {
            senderID: myFloID,
            receiverID: cashierID,
            group: "Cashiers",
        });
        return floGlobals.generalData[fk];
    }
});

Object.defineProperty(Cashier, 'moneyRequests', {
    get: function() {
        let fk = floCloudAPI.util.filterKey(TYPE_MONEY_REQUEST, {
            receiverID: myFloID,
        });
        return floGlobals.generalData[fk];
    }
});

User.findCashier = function() {
    let online = [];
    for (let c in cashierStatus)
        if (cashierStatus[c])
            online.push(c);
    if (!online.length)
        return null;
    else
        return online[floCrypto.randInt(0, online.length)];
}

User.cashToToken = function(cashier, amount, upiTxID) {
    return new Promise((resolve, reject) => {
        if (!floCloudAPI.subAdmins.includes(cashier))
            return reject("Invalid cashier");
        floCloudAPI.sendGeneralData({
                mode: "cash-to-token",
                amount: amount,
                upi_txid: upiTxID
            }, TYPE_CASHIER_REQUEST, {
                receiverID: cashier
            }).then(result => resolve(result))
            .catch(error => reject(error))
    })
}

User.tokenToCash = function(cashier, amount, blkTxID, upiID) {
    return new Promise((resolve, reject) => {
        if (!floCloudAPI.subAdmins.includes(cashier))
            return reject("Invalid cashier");
        floCloudAPI.sendGeneralData({
                mode: "token-to-cash",
                amount: amount,
                token_txid: blkTxID,
                upi_id: upiID
            }, TYPE_CASHIER_REQUEST, {
                receiverID: cashier
            }).then(result => resolve(result))
            .catch(error => reject(error))
    })
}

User.sendToken = function(receiverID, amount, remark = '') {
    return new Promise((resolve, reject) => {
        tokenAPI.sendToken(myPrivKey, amount, receiverID, remark)
            .then(result => resolve(result))
            .catch(error => reject(error))
    })
}

User.requestToken = function(floID, amount, remark = '') {
    return new Promise((resolve, reject) => {
        floCloudAPI.sendGeneralData({
                amount: amount,
                remark: remark
            }, TYPE_MONEY_REQUEST, {
                receiverID: floID
            }).then(result => resolve(result))
            .catch(error => reject(error))
    })
}

User.decideRequest = function(request, note) {
    return new Promise((resolve, reject) => {
        floCloudAPI.noteApplicationData(request.vectorClock, note, {
                receiverID: myFloID
            }).then(result => resolve(result))
            .catch(error => reject(error))
    })
}

const Cashier = {};

Cashier.init = function() {
    return new Promise((resolve, reject) => {
        let promises;
        //Requests from user to cashier(self) for token-cash exchange
        promises.push(floCloudAPI.requestGeneralData(TYPE_CASHIER_REQUEST, {
            receiverID: myFloID,
            callback: cashierUI.renderRequests //UI_fn
        }));
        //Set online status of cashier(self)
        promises.push(floCloudAPI.setStatus());
        /*
        promises.push(floCloudAPI.requestObjectData("UPI", { //Is this needed?
            callback: UI_RENDER_FN
        }));
        */
        Promise.all(promises)
            .then(result => resolve(result))
            .catch(error => reject(error))
    })
}

Object.defineProperty(Cashier, 'Requests', {
    get: function() {
        let fk = floCloudAPI.util.filterKey(TYPE_CASHIER_REQUEST, {
            receiver: myFloID
        });
        return floGlobals.generalData[fk];
    }
});

Cashier.finishRequest = function(request, txid) {
    return new Promise((resolve, reject) => {
        floCloudAPI.tagApplicationData(request.vectorClock, 'COMPLETED', {
            receiverID: myFloID
        }).then(result => {
            floCloudAPI.noteApplicationData(request.vectorClock, txid, {
                    receiverID: myFloID
                }).then(result => resolve(result))
                .catch(error => reject(error))
        }).catch(error => reject(error))
    })
}

Cashier.rejectRequest = function(request, reason) {
    return new Promise((resolve, reject) => {
        floCloudAPI.noteApplicationData(request.vectorClock, "REJECTED:" + reason, {
                receiverID: myFloID
            }).then(result => resolve(result))
            .catch(error => reject(error))
    })
}

Cashier.checkIfUpiTxIsValid = function(upiTxID) {
    return new Promise((resolve, reject) => {
        let requests = Cashier.Requests;
        for (let r in requests)
            if (requests[r].message.mode === "cash-to-token")
                if (requests[r].note === upiTxID)
                    return reject([true, "UPI transaction is already used for another request"]);
        return resolve(true);
    })
}

Cashier.checkIfTokenTxIsValid = function(tokenTxID, sender, amount) {
    return new Promise((resolve, reject) => {
        let requests = Cashier.Requests;
        for (let r in requests)
            if (requests[r].message.mode === "token-to-cash")
                if (requests[r].note === tokenTxID)
                    return reject([true, "Token transaction is already used for another request"]);
        tokenAPI.getTx(tokenTxID).then(tx => {
            let parsedTxData = tokenAPI.util.parseTxData(tx);
            console.debug(parsedTxData);
            if (parsedTxData.type !== "transfer" || parsedTxData.transferType !== "token")
                reject([true, "Invalid token transfer type"]);
            else if (parsedTxData.tokenAmount !== amount)
                reject([true, "Incorrect token amount: " + parsedTxData.tokenAmount]);
            else if (parsedTxData.tokenIdentification !== floGlobals.currency)
                reject([true, "Incorrect token: " + parsedTxData.tokenIdentification]);
            else if (parsedTxData.sender !== sender)
                reject([true, "Incorrect senderID: " + parsedTxData.sender]);
            else if (parsedTxData.receiver !== myFloID)
                reject([true, "Incorrect receiverID: " + parsedTxData.receive])
            else resolve(true);
        }).catch(error => reject([null, error]))
    })
}