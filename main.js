const btnDebtTitle = document.querySelector("#debt-title");
const btnDebtAmountPaid = document.querySelector("#debt-amount-paid");
const btnDebtTotalAmount = document.querySelector("#debt-total-amount");
const btnAddDebt = document.querySelector("#add");
const contentContainer = document.querySelector(".left-side .content");
let btnsDeleteOutstanding;
let btnsEditOutstanding;
let btnsCompletedOutstanding;
let btnsDeleteCompleted;
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
        }
        if (dataContent[0].length > 0) {
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
                redCardNode.classList.add("card");
                redCardNode.classList.add("red-card");
                cardTitleNode.classList.add("title");
                ivePaidNode.classList.add("ive-paid");
                progressNode.classList.add("progress");
                cardTitleNode.innerHTML = `<span>${data.title}</span><span class="tools"><span class="complete-outstanding" data-outstanding-id="${index}" title="Mark as completed"></span><span class="edit-outstanding" data-outstanding-id="${index}" title="Edit"></span><span class="delete-outstanding" data-outstanding-id="${index}" title="Delete"></span></span>`;
                ivePaidNode.innerHTML = `<span>I've paid</span><span class="money">${coolFormatting(data.amountPaid)}</span><span>out of</span><span class="money">${coolFormatting(data.outOf)}</span>`;
                progressNode.innerHTML = `<div class="bar"><div class="inside" style="width: ${calculateProgress(data.amountPaid, data.outOf)}%"></div></div><div class="perc">${calculateProgress(data.amountPaid, data.outOf)}% completed</div>`;
                redCardNode.appendChild(cardTitleNode);
                redCardNode.appendChild(ivePaidNode);
                redCardNode.appendChild(progressNode);
                outstandingBoxNode.append(redCardNode);
            });
            btnsCompleteOutstanding = Array.from(document.querySelectorAll(".complete-outstanding"));
            btnsEditOutstanding = Array.from(document.querySelectorAll(".edit-outstanding"));
            btnsDeleteOutstanding = Array.from(document.querySelectorAll(".delete-outstanding"));
            btnsCompleteOutstanding.map((button) => {
                button.addEventListener("click", () => {
                    let btnDataset = button.dataset;
                    let id = btnDataset.outstandingId;
                    addCompleted(id);
                }, false);
            });
            btnsEditOutstanding.map((button) => {
                button.addEventListener("click", editSelection, false);
            });
            btnsDeleteOutstanding.map((button) => {
                button.addEventListener("click", (selection) => {
                    alertBox("Warning!", "Are you sure you want to delete this?", "Yes", "No", selection);
                }, false);
            });
        }
        if (dataContent[1].length > 0 && dataContent[0].length == 0) {
            contentContainer.innerHTML = "";
        }
        if (dataContent[1].length > 0) {
            let completedBoxNode = document.createElement("section");
            let blueH2Node = document.createElement("h2");
            completedBoxNode.classList.add("completed");
            blueH2Node.innerText = "Completed";
            completedBoxNode.appendChild(blueH2Node);
            contentContainer.appendChild(completedBoxNode);
            dataContent[1].map((data, index) => {
                let blueCardNode = document.createElement("div");
                blueCardNode.classList.add("card");
                blueCardNode.classList.add("blue-card");
                blueCardNode.innerHTML = `<div class="title">${data.title}</div><div class="tools"><div class="money">${coolFormatting(data.amount)}</div><div class="delete-completed" data-completed-id="${index}" title="Delete"></div></div>`;
                completedBoxNode.append(blueCardNode);
            });
            btnsDeleteCompleted = Array.from(document.querySelectorAll(".delete-completed"));
            btnsDeleteCompleted.map((button) => {
                button.addEventListener("click", (selection) => {
                    alertBox("Warning!", "Are you sure you want to delete this?", "Yes", "No", selection);
                }, false);
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

function addCompleted(id) {
    let title = dataContent[0][id].title;
    let amount = dataContent[0][id].outOf;
    if (id == 0) {
        dataContent[0].shift();
    } else {
        dataContent[0].splice(id, id);
    }
    dataContent[1].push(
        {
            title,
            amount
        }
    );
    localStorage.setItem("data", JSON.stringify(dataContent));
    populateContainer();
}

function calculateProgress(amountPaid, outOf) {
    return Math.floor((amountPaid / outOf) * 100);
}

function deleteSelection(node) {
    const dataset = node.target.dataset;
    let index;
    let id;
    if (dataset.outstandingId) {
        index = 0;
        id = dataset.outstandingId;
    }
    if (dataset.completedId) {
        index = 1;
        id = dataset.completedId;
    }
    if (id == 0) {
        dataContent[index].shift();
    } else {
        dataContent[index].splice(id, id);
    }
    if (dataContent[0].length == 0 && dataContent[1].length == 0) {
        localStorage.clear();
    } else {
        localStorage.setItem("data", JSON.stringify(dataContent));
    }
    populateContainer();
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
        \n<span>I've paid</span><span class="money"><span class="sign">$</span><input type="text" class="moneyInput" value="${amountPaid}"></span><span>out of</span><span class="money">${coolFormatting(outOf)}</span>
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
    if (dataset.completedId) {

    }
}

function numberWithDecimals(number) {
    return parseFloat(Math.round(number * 100) / 100).toFixed(2);
}

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function validateUpdate(title, amountPaid, outOf, id) {
    if (title == "" || title == null || amountPaid == "" || amountPaid == null || isNaN(amountPaid) || outOf == "" || outOf == null || isNaN(outOf)) {
        alertBox("Alert", "You have to make sure you filled each field correctly.", false, "Okay");
    } else {
        let formatAmountPaid = numberWithDecimals(amountPaid);
        let formatOutOf = numberWithDecimals(outOf);
        if (Number(formatAmountPaid) > Number(formatOutOf)) {
            alertBox("Alert", "The amount you've paid cannot be greater than the total amount.", false, "Okay");
        } else if (Number(formatAmountPaid) == Number(formatOutOf)) {
            addCompleted(id);
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

function alertBox(title, message, option_1, option_2, nodeToDelete = null) {
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
            deleteSelection(nodeToDelete);
            document.querySelector(".alert-container").remove();
            return true;
        }, false);
        document.querySelector(".alert-box .cancel").addEventListener("click", () => {
            document.querySelector(".alert-container").remove();
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

function coolFormatting(nonformattedAmount) {
    let amount = numberWithCommas(nonformattedAmount);
    let withoutDecimals = amount.substr(0, amount.length - 3);
    let twoLast = amount.substr(amount.length - 2, amount.length - 1);
    return `<span class="sign">$</span><span class="amount">${withoutDecimals}</span><span class="decimals">.${twoLast}</span>`;
}