const btnDebtTitle = document.querySelector("#debt-title");
const btnDebtAmountPaid = document.querySelector("#debt-amount-paid");
const btnDebtTotalAmount = document.querySelector("#debt-total-amount");
const btnAddDebt = document.querySelector("#add");
const contentContainer = document.querySelector(".left-side .content");
let btnsDeleteOutstanding;
let btnsEditOutstanding;
let dataContent = [[], []];

if (localStorage.key("data")) {
    dataContent = JSON.parse(localStorage.getItem("data"));
}

btnAddDebt.addEventListener("click", () => {
    let successful = addDebt(btnDebtTitle.value, btnDebtAmountPaid.value, btnDebtTotalAmount.value);
    if (successful) {
        btnDebtTitle.value = "";
        btnDebtAmountPaid.value = "";
        btnDebtTotalAmount.value = "";
        populateContainer();
    }
}, false);

window.addEventListener("load", populateContainer, false);

function populateContainer() {
    if (dataContent[0].length == 0 && dataContent[1].length == 0) {
        contentContainer.innerHTML = "It looks like there is no debt!";
    } else {
        if (dataContent[0].length > 0) {
            contentContainer.innerHTML = "";
            let outstandingBoxNode = document.createElement("section");
            let redH2Node = document.createElement("h2");
            outstandingBoxNode.classList.add("outstanding");
            redH2Node.innerText = "Outstanding";
            outstandingBoxNode.appendChild(redH2Node);
            contentContainer.appendChild(outstandingBoxNode);
            dataContent[0].map((data, index) => {
                let redCardNode = document.createElement("div");
                let cardTitleNode = document.createElement("div");
                let ivePaidNode = document.createElement("div");
                let progressNode = document.createElement("div");
                let amountPaidFormatted = numberWithCommas(data.amountPaid);
                let outOfFormatted = numberWithCommas(data.outOf);
                redCardNode.classList.add("card");
                redCardNode.classList.add("red-card");
                cardTitleNode.classList.add("title");
                ivePaidNode.classList.add("ive-paid");
                progressNode.classList.add("progress");
                cardTitleNode.innerHTML = `<span>${data.title}</span><span class="tools"><span class="edit-outstanding" data-outstanding-id="${index}">Edit</span> | <span class="delete-outstanding" data-outstanding-id="${index}">Delete</span></span>`;
                ivePaidNode.innerHTML = `<span>I've paid</span><span class="money"><span class="sign">$</span><span class="amount">${amountPaidFormatted}</span><span class="decimals">.00</span></span><span>out of</span><span class="money"><span class="sign">$</span><span class="amount">${outOfFormatted}</span><span class="decimals">.00</span></span>`;
                progressNode.innerHTML = `<div class="bar"><div class="inside" style="width: ${calculateProgress(data.amountPaid, data.outOf)}%"></div></div><div class="perc">${calculateProgress(data.amountPaid, data.outOf)}% completed</div>`;
                redCardNode.appendChild(cardTitleNode);
                redCardNode.appendChild(ivePaidNode);
                redCardNode.appendChild(progressNode);
                outstandingBoxNode.append(redCardNode);
                btnsEditOutstanding = Array.from(document.querySelectorAll(".edit-outstanding"));
                btnsDeleteOutstanding = Array.from(document.querySelectorAll(".delete-outstanding"));
            });
            btnsEditOutstanding.map((button) => {
                button.addEventListener("click", editSelection, false);
            });
            btnsDeleteOutstanding.map((button) => {
                button.addEventListener("click", deleteSelection, false);
            });
        }
    }
}

function addDebt(title, amountPaid, outOf) {
    if (title == "" || title == null || amountPaid == "" || amountPaid == null || isNaN(amountPaid) || outOf == "" || outOf == null || isNaN(outOf)) {
        alertBox("Alert", "You have to make sure you filled each field correctly.", false, "Okay");
        return false;
    } else {
        let formatAmountPaid = numberWithDecimals(amountPaid);
        let formatOutOf = numberWithDecimals(outOf);
        if (Number(formatAmountPaid) > Number(formatOutOf)) {
            alertBox("Alert", "The amount you've paid cannot be greater than the total amount.", false, "Okay");
            return false;
        } else if (Number(formatAmountPaid) == Number(formatOutOf)) {
            alertBox("Alert", "The amount you've paid cannot be equal to the total amount.", false, "Okay");
            return false;
        } else {
            dataContent[0].push(
                {
                    title,
                    amountPaid: formatAmountPaid,
                    outOf: formatOutOf
                }
            );
            localStorage.setItem("data", JSON.stringify(dataContent));
            return true;
        }
    }
}

function calculateProgress(amountPaid, outOf) {
    return Math.floor((amountPaid / outOf) * 100);
}

function deleteSelection(node) {
    const dataset = node.target.dataset;
    if (dataset.outstandingId) {
        let id = dataset.outstandingId;
        if (id == 0) {
            dataContent[0].shift();
        } else {
            dataContent[0].splice(id, id);
        }
        if (dataContent[0].length == 0 && dataContent[1].length == 0) {
            localStorage.clear();
        } else {
            localStorage.setItem("data", JSON.stringify(dataContent));
        }
        populateContainer();
    }
    if (dataset.balanceId) {

    }
}

function editSelection(node) {
    const dataset = node.target.dataset;
    const redCardNode = node.target.parentNode.parentNode.parentNode;
    if (dataset.outstandingId) {
        let id = dataset.outstandingId;
        let title = dataContent[0][id].title;
        let amountPaid = dataContent[0][id].amountPaid;
        let outOf = dataContent[0][id].outOf;
        let btnApply;
        let btnCancel;
        let newTitle;
        let newAmountPaid;
        redCardNode.innerHTML = 
        `<input class="titleInput" value="${title}">
        \n<div class="ive-paid">
        \n<span>I've paid</span><span class="money"><span class="sign">$</span><input type="text" class="moneyInput" value="${amountPaid}"></span><span>out of</span><span class="money"><span class="sign">$</span><span class="amount">${outOf}</span><span class="decimals">.00</span></span>
        \n</div>
        \n<div class="buttons"><button class="applyChanges">Apply</button><div class="space"></div><button class="cancelChanges">Cancel</button></div>`;
        newTitle = document.querySelector(".titleInput");
        newAmountPaid = document.querySelector(".moneyInput");
        btnApply = document.querySelector(".applyChanges");
        btnCancel = document.querySelector(".cancelChanges");
        btnApply.addEventListener("click", () => {
            validateUpdate(newTitle.value, newAmountPaid.value, outOf, id);
        }, false);
        btnCancel.addEventListener("click", populateContainer, false);
    }
    if (dataset.balanceId) {

    }
}

function numberWithDecimals(number) {
    return parseFloat(Math.round(number * 100) / 100).toFixed(2);
}

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function validateUpdate(title, amountPaid, outOf, id) {
    console.log(title, amountPaid, outOf, id)
    if (title == "" || title == null || amountPaid == "" || amountPaid == null || isNaN(amountPaid) || outOf == "" || outOf == null || isNaN(outOf)) {
        alertBox("Alert", "You have to make sure you filled each field correctly.", false, "Okay");
    } else {
        let formatAmountPaid = numberWithDecimals(amountPaid);
        let formatOutOf = numberWithDecimals(outOf);
        if (Number(formatAmountPaid) > Number(formatOutOf)) {
            alertBox("Alert", "The amount you've paid cannot be greater than the total amount.", false, "Okay");
        } else if (Number(formatAmountPaid) == Number(formatOutOf)) {
            alertBox("Alert", "The amount you've paid cannot be equal to the total amount.", false, "Okay");
        } else {
            dataContent[0][id] = {
                title,
                amountPaid: formatAmountPaid,
                outOf: formatOutOf
            };
            localStorage.setItem("data", JSON.stringify(dataContent));
            populateContainer();
        }
    }
}

function alertBox(title, message, option_1, option_2) {
    let containerNode = document.createElement("div");
    let alertBoxNode = document.createElement("div");
    let titleNode = document.createElement("div");
    let messageNode = document.createElement("div");
    let optionsNode = document.createElement("div");
    let option_1Node;
    let option_2Node;
    containerNode.classList.add("alert-container");
    alertBoxNode.classList.add("alert-box");
    titleNode.classList.add("title");
    messageNode.classList.add("message");
    optionsNode.classList.add("options");
    titleNode.innerText = title;
    messageNode.innerText = message;
    alertBoxNode.append(titleNode);
    alertBoxNode.append(messageNode);
    containerNode.append(alertBoxNode);
    if (option_1 && option_2) {
        let spaceNode = document.createElement("div");
        option_1Node = document.createElement("button");
        option_2Node = document.createElement("button");
        spaceNode.classList.add("space");
        option_1Node.classList.add("accept");
        option_2Node.classList.add("cancel");
        option_1Node.innerText = option_1;
        option_2Node.innerText = option_2;
        optionsNode.append(option_1Node);
        optionsNode.append(spaceNode);
        optionsNode.append(option_2Node);
        alertBoxNode.append(optionsNode);
        document.body.prepend(containerNode);
        document.querySelector(".alert-box .accept").addEventListener("click", () => {
            return true;
        }, false);
        document.querySelector(".alert-box .cancel").addEventListener("click", () => {
            return false;
        }, false);
    } else if (option_1) {
        option_1Node = document.createElement("button");
        option_1Node.classList.add("accept");
        option_1Node.innerText = option_1;
        optionsNode.append(option_1Node);
        alertBoxNode.append(optionsNode);
        document.body.prepend(containerNode);
        document.querySelector(".alert-box .accept").addEventListener("click", () => {
            document.querySelector(".alert-container").remove();
        }, false);
    } else {
        option_2Node = document.createElement("button");
        option_2Node.classList.add("cancel");
        option_2Node.innerText = option_2;
        optionsNode.append(option_2Node);
        alertBoxNode.append(optionsNode);
        document.body.prepend(containerNode);
        document.querySelector(".alert-box .cancel").addEventListener("click", () => {
            document.querySelector(".alert-container").remove();
        }, false);
    }
}