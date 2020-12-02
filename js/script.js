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

    headers.map((element) => {
      this.headers.push(element.textContent)
    })
    console.log(this.headers)

    trs.map((tr) => {
      const cells = [...tr.children]
      const item = {
        id: this.generateUUID(),
        values: [],
      }

      cells.map((cell) => {
        if (cell.children.length > 0) {
          const statusElement = [...cell.children][0]
          const status = statusElement.getAttribute('class')
          if (status !== null) {
            item.values.push(`<span classs='${status}'></span>`)
          }
        } else {
          item.values.push(cell.textContent)
        }
      })
      this.items.push(item)
    })
    console.log(this.items)
  }

  generateUUID() {
    return (Date.now() * Math.floor(Math.random() * 10000)).toString()
  }

  makeTable() {
    this.copyItems = [...this.items]
    this.initPagination(this.pagination.length, this.numberOfEntries)

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
          <select name="n-entries" id="n-enties" class="n-entries">
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
      console.log('jeader', header)
      this.element.querySelector('thead tr').innerHTML = `<tr>${header}</tr>`
    })
  }
  renderRows() {}
  renderPagesButtons() {} // buttons for pagination
  renderHeaderButtons() {} // action buttons
  renderSearch() {} // search box
  renderSelectEntries() {} //show elements selected previously
}
