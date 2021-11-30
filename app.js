let Modal = {
    open(){
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    },

    close(){
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    }
}

let ModalErro = {
    open(){
        document
            .querySelector('.modal-alert')
            .classList
            .toggle('active')
    },

    close(){
        document
            .querySelector('.modal-alert')
            .classList
            .toggle('active')
    }
    
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

const Transaction = {

    // all: [
    //     {
    //         // id: 1,
    //         description: 'LUZ',
    //         amount: -50000,
    //         date: '23/11/2021'
    //     },
    // ],

    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },

    expenses() {
        let expense = 0

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
    },

    total() {
        let total = this.incomes() + this.expenses()

        if(total > 0) {
            document
            .querySelector('.total')
            .classList
            .remove('bg')
        } else if (total < 0){
            document
            .querySelector('.total')
            .classList
            .add('bg')
        } else {
            document
            .querySelector('.total')
            .classList
            .remove('bg')

            document
            .querySelector('.total')
            .classList
            .add('default')
        }

        return total
    }
}

// GRÁFICO ===============================================

let valores = []
let descricao = []
let values = Transaction.all.forEach(values =>{
    valores.push(values.amount / 100)
    descricao.push(values.description)
})

let ctx = document.getElementsByClassName('line-chart')

function colorize(opacidade) {
    return (ctx) => {
        const v = ctx.parsed.y;
        const c = v < 0 ? '#e92929' : '#57dd81';
        return opacidade ? c : (c + 25);
    };
}

let chartGraph = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: descricao.map((valorData) => valorData),
        datasets: [
            {
                label: 'R$',
                data: valores.map((valorValue) => valorValue),
                backgroundColor: 'rgba(131, 41, 233, 0.2)',
                borderColor: 'rgba(131, 41, 233, 1)',
                borderWidth: 2,
            },
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: false, 
            title: {
                display: true,
                text: 'Transações'
            },
        },
        scales: {
            x: {
                title: {
                  display: true,
                  text: 'Descrição'
                },
                gridLines: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Valor - R$'
                },
                gridLines: {
                    display: false,
                },
                ticks: {
                    stepSize: 250
                }
            }
        },
        elements: {
            // bar: {
            //     backgroundColor: colorize(false),
            //     borderColor: colorize(true),
            //     borderWidth: 2
            // }
        },
        animation: {
            duration: 2000
        }
    }
});

// ===============================================


const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td class="">
                <img onclick="Transaction.remove(${index})" class="btn-remover" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html;
    },

    updateBalance() {
        document
            .getElementById('incomesDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        // value = Number(value.replace(/\,\./g, '') * 100)
        return value
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''
        
        value = String(value).replace(/\D/g, '')

        value = Number(value)/100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return (signal + value)
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields(){
        const {description, amount, date} = Form.getValues()
        if(description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos')
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    
    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        } catch (e) {
            // alert(e.message)
            ModalErro.open();
        }
    }
}


const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    
    reload(){
        DOM.clearTransactions()
        App.init()
        document.location.reload(true);
    },
}

App.init();
