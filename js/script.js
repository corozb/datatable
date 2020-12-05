class DataTable {
  element
  headers
  items
  copyItems
  selected
  pagination
  numberOfEntries
  headerButtons

  constructor(selector, headerButtons) {
    this.element = document.querySelector(selector)
    this.headers = []
    this.items = []
    this.pagination = {
      total: 0,
      noItemsPerPage: 0,
      noPages: 0,
      actual: 0,
      pointer: 0,
      diff: 0,
      lastPageBeforeDots: 0,
      noButtonsBeforeDots: 4,
    }
    this.selected = []
    this.numberOfEntries = 5
    this.headerButtons = headerButtons
  }

  parse() {
    const headers = [...this.element.querySelector('thead tr').children]
    const trs = [...this.element.querySelector('tbody').children]

    headers.forEach((element) => {
      this.headers.push(element.textContent)
    })

    trs.forEach((tr) => {
      const cells = [...tr.children]
      const item = {
        id: this.generateUUID(),
        values: [],
      }

      cells.forEach((cell) => {
        if (cell.children.length > 0) {
          const statusElement = [...cell.children][0]
          const status = statusElement.getAttribute('class')
          if (status !== null) {
            item.values.push(`<span class='${status}'></span>`)
          }
        } else {
          item.values.push(cell.textContent)
        }
      })
      this.items.push(item)
    })
    console.log(this.items)

    this.makeTable()
  }

  makeTable() {
    this.copyItems = [...this.items]
    this.initPagination(this.items.length, this.numberOfEntries)

    const container = document.createElement('div')
    container.id = this.element.id
    this.element.innerHTML = ''
    this.element.replaceWith(container)
    this.element = container

    this.createElement() // basis structure
    this.renderHeaders() // build header
    this.renderRows()
    this.renderPagesButtons() // buttons for pagination
    this.renderHeaderButtons() // action buttons
    this.renderSearch() // search box
    this.renderSelectEntries() //show elements selected previously
  }

  initPagination(total, entries) {
    this.pagination.total = total
    this.pagination.noItemsPerPage = entries
    this.pagination.noPages = Math.ceil(
      this.pagination.total / this.pagination.noItemsPerPage
    )
    this.pagination.actual = 1
    this.pagination.pointer = 0
    this.pagination.diff =
      this.pagination.noItemsPerPage -
      (this.pagination.total % this.pagination.noItemsPerPage)
  }

  generateUUID() {
    return (Date.now() * Math.floor(Math.random() * 100000)).toString()
  }

  createElement() {
    // basis structure
    this.element.innerHTML = `
    <div class="datatable-container">
      <div class="header-tools">
        <div class="tools">
          <ul class='header-buttons-container'>
          </ul>
        </div>
        <div class="search">
          <input type="text" class="search-input">
        </div>
      </div>

      <table class="datatable">
        <thead>
          <tr>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>

      <div class="footer-tools">
        <div class="list-items">
          Show
          <select name="n-entries" id="n-entries" class="n-entries">
          </select>
          entries
        </div>
        <div class="pages">
        </div>
      </div>
    `
  }
  renderHeaders() {
    // build header
    this.element.querySelector('thead tr').innerHTML = ''
    this.headers.forEach((header) => {
      this.element.querySelector('thead tr').innerHTML += `<th>${header}</th>`
    })
  }

  renderRows() {
    this.element.querySelector('tbody').innerHTML = ''

    let i = 0
    const { pointer, total } = this.pagination
    const limit = this.pagination.actual * this.pagination.noItemsPerPage

    for (i = pointer; i < limit; i++) {
      if (i === total) break

      const { id, values } = this.copyItems[i]
      const checked = this.isChecked(id)

      let data = ''

      data += `
        <td class="table-checkbox">
          <input type="checkbox" class='datatable-checkbox' data-id=${id} ${
        checked ? 'checked' : ''
      } name="" id="">
        </td>
      `

      values.forEach((cell) => {
        data += `<td>${cell}</td>`
      })

      this.element.querySelector('tbody').innerHTML += `<tr>${data}</tr>`

      // checkbox listener
      const checkboxes = document.querySelectorAll('.datatable-checkbox')
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('click', (e) => {
          const element = e.target
          const id = element.getAttribute('data-id')

          if (element.checked) {
            const item = this.getItem(id)
            this.selected.push(item)
          } else {
            this.removeSelected(id)
          }

          console.log(this.selected)
        })
      })
    }
  }

  isChecked(id) {
    const items = this.selected
    let res = false

    if (items.length === 0) return false

    items.forEach((item) => {
      if (item.id === id) res = true
    })

    return res
  }

  getItem(id) {
    const res = this.items.filter((item) => item.id === id)
    if (res.length === 0) return null
    return res[0]
  }

  removeSelected(id) {
    const res = this.selected.filter((item) => item.id !== id)
    this.selected = [...res]
  }

  renderPagesButtons() {
    // buttons for pagination
    const pagesContainer = this.element.querySelector('.pages')
    let pages = ''

    const buttonsToShow = this.pagination.noButtonsBeforeDots
    const actualIndex = this.pagination.actual
    console.log('actualIndex', actualIndex)

    let limitInf = Math.max(actualIndex - 2, 1)
    let limitSup = Math.min(actualIndex + 2, this.pagination.noPages)
    const missinButtons = buttonsToShow - (limitSup - limitInf)
    console.log('limitInf', limitInf)
    console.log('limiSup', limitSup)
    console.log('missinButtons', missinButtons)

    if (Math.max(limitInf - missinButtons, 0)) {
      limitInf = limitInf - missinButtons
    } else if (
      Math.min(limitSup + missinButtons, this.pagination.noPages) !==
      this.pagination.noPages
    ) {
      limitSup = limitSup + missinButtons
    }

    if (limitSup < this.pagination.noPages - 2) {
      pages += this.getIterateButtons(limitInf, limitSup)
      pages += '<li>...</li>'
      pages += this.getIterateButtons(
        this.pagination.noPages - 1,
        this.pagination.noPages
      )
    } else {
      pages += this.getIterateButtons(limitInf, this.pagination.noPages)
    }

    pagesContainer.innerHTML = `<ul>${pages}</ul>`

    const buttons = this.element.querySelectorAll('.pages li button')
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        this.pagination.actual = +e.target.getAttribute('data-page')
        this.pagination.pointer =
          this.pagination.actual * this.pagination.noItemsPerPage -
          this.pagination.noItemsPerPage
        this.renderRows()
        this.renderPagesButtons()
      })
    })
  }

  getIterateButtons(start, end) {
    let res = ''

    for (let i = start; i <= end; i++) {
      if (i === this.pagination.actual) {
        res += `<li><span class='active'>${i}</span></li>`
      } else {
        res += `<li><button data-page='${i}'>${i}</button></li>`
      }
    }

    return res
  }

  renderHeaderButtons() {
    // action buttons
    let html = ''
    const buttonContainer = this.element.querySelector(
      '.header-buttons-container'
    )
    const headerButtons = this.headerButtons
    console.log('headerButtons', headerButtons)

    headerButtons.forEach((button) => {
      html += `
      <li>
        <button id=${button.id}>
          <i class="material-icons">${button.icon}</i>
        </button>
      </li>`
    })

    buttonContainer.innerHTML = html

    headerButtons.forEach((button) => {
      document
        .querySelector('#' + button.id)
        .addEventListener('click', button.action)
    })
  }

  renderSearch() {
    // search box
    const input = this.element.querySelector('.search-input')
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase()

      if (query === '') {
        this.copyItem = [...this.items]
        this.initPagination(this.copyItems.length, this.numberOfEntries)
        this.renderRows()
        this.renderPagesButtons()
        return
      }

      this.search(query)
      this.initPagination(this.copyItems.length, this.numberOfEntries)
      this.renderRows()
      this.renderPagesButtons()
    })
  }

  search(query) {
    let res = []

    this.copyItems = [...this.items]

    for (let i = 0; i < this.copyItems.length; i++) {
      const { id, values } = this.copyItems[i]
      const row = values

      for (let j = 0; j < row.length; j++) {
        const cell = row[j]

        if (cell.toLowerCase().indexOf(query) >= 0) {
          res.push(this.copyItems[i])
          break
        }
      }
    }

    this.copyItems = [...res]
  }
  renderSelectEntries() {
    //show elements selected previously
    const select = this.element.querySelector('#n-entries')
    const html = [5, 10, 15].reduce((acc, el) => {
      return (acc += `<option value=${el} ${
        this.numberOfEntries === el ? 'selected' : el
      }></option>`)
    }, '')
    select.innerHTML = html
    this.element.querySelector('#n-entries').addEventListener('change', (e) => {
      const numberOfEntries = parseInt(e.target.value)
      this.numberOfEntries = numberOfEntries

      this.initPagination(this.copyItems.length, this.numberOfEntries)
      this.renderRows()
      this.renderPagesButtons()
      this.renderSearch()
    })
  }

  getSelected() {
    return this.selected
  }

  add(item) {
    const row = {
      id: this.generateUUID(),
      values: [],
    }

    const status = `<span class=${item[0]}></span>`
    item.shift()
    row.values = [status, ...item]
    this.items = [row, ...this.items]
    this.makeTable()
  }
}
