import Company from "./company.js";

class Table {
  constructor(tabOfCompanies) {
    this.tabOfCompanies = tabOfCompanies;
    this.quantitisOfRow = 10;
    this.indexOfPage = 1;
    this.tabLength = this.tabOfCompanies.length;
    this.quantityOfPages = Math.ceil(
      this.tabOfCompanies.length / this.quantitisOfRow
    );
    this.sortedColumnId = 4;
    this.direction = -1;
  }

  init() {
    this.displayInterface();
    this.display();
  }

  getTotalIncomes() {
    const promises = this.tabOfCompanies.map(el => {
      return new Promise((resolve, reject) => {
        const company = new Company(el.id, el.name, el.city, 0);
        company.getTotalIncome().then(total => {
          resolve(Object.assign(el, { totalIncome: total }));
        });
      });
    });
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(companies => {
        companies.sort((a, b) => {
          return b.totalIncome - a.totalIncome;
        });
        this.tabOfCompanies = companies;
        this.filteredTabOfCompanies = companies;
        resolve("done");
      });
    });
  }

  displayInterface() {
    const body = document.querySelector("body");
    const container = document.createElement("div");
    container.classList.add("container");
    body.appendChild(container);
    const searchModule = document.createElement("div");
    searchModule.classList.add("search-module");
    container.appendChild(searchModule);
    const sortInput = document.createElement("select");
    sortInput.id = "sort-input";

    const option = document.createElement("option");
    option.value = 0;
    option.innerText = "-";
    sortInput.appendChild(option);

    const option1 = document.createElement("option");
    option1.value = 1;
    option1.innerText = "name - ascending";
    sortInput.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = -1;
    option2.innerText = "name - descending";
    sortInput.appendChild(option2);

    const option3 = document.createElement("option");
    option3.value = 2;
    option3.innerText = "city - ascending";
    sortInput.appendChild(option3);

    const option4 = document.createElement("option");
    option4.value = -2;
    option4.innerText = "city - descanding";
    sortInput.appendChild(option4);

    const option5 = document.createElement("option");
    option5.value = 3;
    option5.innerText = "income - ascending";
    sortInput.appendChild(option5);

    const option6 = document.createElement("option");
    option6.value = -3;
    option6.innerText = "income - descending";
    sortInput.appendChild(option6);

    const search = document.createElement("div");
    search.classList.add("search");
    const span = document.createElement("span");
    span.innerHTML = `<i class="fas fa-search"></i>`;
    search.appendChild(span);
    const filterName = document.createElement("input");
    filterName.name = "filter-name";
    filterName.type = "text";
    filterName.placeholder = "Search name or city";
    filterName.addEventListener("keyup", this.filterNames.bind(this));
    const removeButton = document.createElement("button");
    removeButton.innerHTML = `<i class="fas fa-times"></i>`;
    removeButton.addEventListener("click", this.clearInput.bind(this));
    search.appendChild(filterName);
    search.appendChild(removeButton);
    searchModule.appendChild(search);

    searchModule.appendChild(sortInput);

    sortInput.addEventListener("change", this.sortColumn.bind(this, false));

    const table = document.createElement("table");
    container.appendChild(table);
    const thead = document.createElement("thead");
    table.appendChild(thead);
    const headrow = document.createElement("tr");
    thead.appendChild(headrow);

    const headerLp = document.createElement("th");
    headerLp.width = "5%";
    headerLp.innerText = "No.";
    headrow.appendChild(headerLp);

    this.printHead(headrow, "Name", "50", 2);
    this.printHead(headrow, "City", "30", 3);
    this.printHead(headrow, "Total Income", "15", 4);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    const pagination = document.createElement("div");
    pagination.classList.add("pagination");
    container.appendChild(pagination);
  }

  printHead(place, name, width, columnId) {
    const header = document.createElement("th");
    header.width = `${width}%`;

    const head = document.createElement("div");
    head.classList.add("head");

    const title = document.createElement("span");
    title.classList.add("column-title");
    title.innerText = name;

    const sortIcon = document.createElement("span");
    if (columnId !== this.sortedColumnId) {
      sortIcon.innerHTML = `<i class="fas fa-sort-down"></i>`;
    } else {
      if (this.direction < 0) {
        sortIcon.innerHTML = `<i class="fas fa-sort-up"></i>`;
      } else if (this.direction > 0) {
        sortIcon.innerHTML = `<i class="fas fa-times"></i>`;
      } else {
        sortIcon.innerHTML = `<i class="fas fa-sort-down"></i>`;
      }
    }
    sortIcon.classList.add("sort-icon");
    sortIcon.addEventListener("click", this.sortColumn.bind(this, columnId));

    head.appendChild(title);
    head.appendChild(sortIcon);
    header.appendChild(head);
    place.appendChild(header);
  }

  sortColumn(columnId) {
    let selectValue = 0;
    if (columnId) {
      if (this.sortedColumnId === columnId) {
        if ((3 + this.direction - 1) % 3 === 2) {
          this.direction = -1;
        } else {
          this.direction = (3 + this.direction - 1) % 3;
        }
      } else {
        this.sortedColumnId = columnId;
        this.direction = -1;
      }
      selectValue = this.direction * (this.sortedColumnId - 1);
    } else {
      this.sortedColumnId = Math.abs(event.target.value) + 1;
      this.direction = Math.sign(event.target.value);
      selectValue = event.target.value;
    }
    this.sortData();
    this.changeInterface(selectValue);
    this.display();
  }

  changeInterface(selectValue) {
    const thead = document.createElement("thead");
    let oldThead = document.querySelector("thead");
    const headrow = document.createElement("tr");
    thead.appendChild(headrow);

    const headerLp = document.createElement("th");
    headerLp.width = "5%";
    headerLp.innerText = "Lp.";
    headrow.appendChild(headerLp);

    this.printHead(headrow, "Name", "50", 2);
    this.printHead(headrow, "City", "30", 3);
    this.printHead(headrow, "Total Income", "15", 4);
    oldThead.replaceWith(thead);

    let sortInput = document.querySelector("#sort-input");
    sortInput.value = selectValue;
  }

  display() {
    let tbody = document.querySelector("tbody");
    tbody.remove();
    const table = document.querySelector("table");
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
    for (
      let i = this.quantitisOfRow * (this.indexOfPage - 1);
      i < this.quantitisOfRow * this.indexOfPage;
      i++
    ) {
      if (!this.filteredTabOfCompanies[i]) {
        break;
      }
      const tr = document.createElement("tr");
      tr.addEventListener(
        "click",
        this.getInfo.bind(
          this,
          parseInt(this.filteredTabOfCompanies[i].id),
          this.filteredTabOfCompanies[i].name,
          this.filteredTabOfCompanies[i].city,
          this.filteredTabOfCompanies[i].totalIncome.toFixed(2)
        )
      );
      tbody.appendChild(tr);
      const lp = document.createElement("td");
      lp.innerText = i + 1;
      tr.appendChild(lp);
      const phrase = document.querySelector("input[type=text]").value;
      const name = document.createElement("td");
      name.innerHTML = this.hightlightText(
        this.filteredTabOfCompanies[i].name,
        phrase
      );
      tr.appendChild(name);
      const city = document.createElement("td");
      city.innerHTML = this.hightlightText(
        this.filteredTabOfCompanies[i].city,
        phrase
      );
      tr.appendChild(city);

      const totalIncomeTd = document.createElement("td");
      totalIncomeTd.innerText = this.filteredTabOfCompanies[
        i
      ].totalIncome.toFixed(2);
      tr.appendChild(totalIncomeTd);
    }
    this.generatePagiantion();
  }

  hightlightText(text, phrase) {
    if (phrase.length > 0) {
      let start = "";
      let mid = "";
      let end = "";
      const lengthOfPhrase = phrase.length;
      const startOfPhrase = text.toLowerCase().indexOf(phrase.toLowerCase());
      const endOfPhrase = startOfPhrase + lengthOfPhrase;
      if (startOfPhrase !== -1) {
        if (startOfPhrase === 0 && endOfPhrase !== text.length) {
          mid = text.substring(startOfPhrase, endOfPhrase);
          end = text.substring(endOfPhrase);
        } else if (endOfPhrase === text.length && startOfPhrase !== 0) {
          start = text.substring(0, startOfPhrase);
          mid = text.substring(startOfPhrase, endOfPhrase);
        } else if (startOfPhrase === 0 && endOfPhrase === text.length) {
          mid = text.substring(startOfPhrase, endOfPhrase);
        } else {
          start = text.substring(0, startOfPhrase);
          mid = text.substring(startOfPhrase, endOfPhrase);
          end = text.substring(endOfPhrase);
        }
        return `${start}<span class="bold">${mid}</span>${end}`;
      } else {
        return text;
      }
    } else {
      return text;
    }
  }

  filterNames() {
    const filterNameInput = document.querySelector("input[type=text]");
    this.filteredTabOfCompanies = this.tabOfCompanies.filter(
      el =>
        el.name.toLowerCase().includes(filterNameInput.value.toLowerCase()) ||
        el.city.toLowerCase().includes(filterNameInput.value.toLowerCase())
    );
    this.sortData();
    this.indexOfPage = 1;
    this.tabLength = this.filteredTabOfCompanies.length;
    this.quantityOfPages = Math.ceil(
      this.filteredTabOfCompanies.length / this.quantitisOfRow
    );
    this.display();
  }

  sortData() {
    if (this.direction !== 0) {
      if (this.sortedColumnId === 4) {
        this.filteredTabOfCompanies.sort((a, b) => {
          return this.direction * (a.totalIncome - b.totalIncome);
        });
      } else if (this.sortedColumnId === 2) {
        if (this.direction > 0) {
          this.filteredTabOfCompanies.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
        } else {
          this.filteredTabOfCompanies
            .sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
            .reverse();
        }
      } else {
        if (this.direction > 0) {
          this.filteredTabOfCompanies.sort((a, b) => {
            return a.city.localeCompare(b.city);
          });
        } else {
          this.filteredTabOfCompanies
            .sort((a, b) => {
              return a.city.localeCompare(b.city);
            })
            .reverse();
        }
      }
    } else {
      this.filteredTabOfCompanies.sort((a, b) => {
        return a.id - b.id;
      });
    }
  }

  generatePagiantion() {
    const container = document.querySelector(".container");
    let pagination = document.querySelector(".pagination");
    pagination.remove();
    pagination = document.createElement("div");
    pagination.classList.add("pagination");
    container.appendChild(pagination);
    const list = document.createElement("ul");
    pagination.appendChild(list);
    const first = document.createElement("li");
    first.innerHTML = `<a href="#" data-page="1"><i class="fas fa-angle-double-left"></i></a>`;
    list.appendChild(first);
    const prev = document.createElement("li");
    if (this.indexOfPage == 1) {
      prev.innerHTML = `<i class="fas fa-angle-left">`;
      prev.classList.add("inactive");
    } else {
      prev.innerHTML = `<a href="#" data-page="${this.indexOfPage -
        1}"><i class="fas fa-angle-left"></i></a>`;
    }
    list.appendChild(prev);
    if (this.indexOfPage == 1) {
      for (let i = 1; i <= Math.min(3, this.quantityOfPages); i++) {
        const page = document.createElement("li");
        page.innerHTML = `<a href="#" data-page="${i}">${
          i === this.indexOfPage ? '<span class="bold">' + i + "</span>" : i
        }</a>`;
        list.appendChild(page);
      }
    } else if (this.indexOfPage == this.quantityOfPages) {
      for (
        let i = Math.max(this.indexOfPage - 2, 1);
        i <= this.indexOfPage;
        i++
      ) {
        const page = document.createElement("li");
        page.innerHTML = `<a href="#" data-page="${i}">${
          i === this.indexOfPage ? '<span class="bold">' + i + "</span>" : i
        }</a>`;
        list.appendChild(page);
      }
    } else {
      for (let i = this.indexOfPage - 1; i <= this.indexOfPage + 1; i++) {
        const page = document.createElement("li");
        page.innerHTML = `<a href="#" data-page="${i}">${
          i === this.indexOfPage ? '<span class="bold">' + i + "</span>" : i
        }</a>`;
        list.appendChild(page);
      }
    }
    const next = document.createElement("li");
    if (this.indexOfPage == this.quantityOfPages) {
      next.innerHTML = `<i class="fas fa-angle-right"></i>`;
      next.classList.add("inactive");
    } else {
      next.innerHTML = `<a href="#" data-page="${this.indexOfPage +
        1}"><i class="fas fa-angle-right"></i></a>`;
    }
    list.appendChild(next);
    const last = document.createElement("li");
    last.innerHTML = `<a href="#" data-page="${Math.ceil(
      this.tabLength / this.quantitisOfRow
    )}"><i class="fas fa-angle-double-right"></i></a>`;
    list.appendChild(last);
    const pages = document.querySelectorAll("a");
    pages.forEach(el => {
      const page = parseInt(el.dataset.page);
      el.addEventListener("click", this.getPage.bind(this, page));
    });
  }

  getPage(page) {
    this.indexOfPage = page;
    this.display();
  }

  getInfo(id, name, city, totalIncome) {
    this.closeTable();
    const company = new Company(id, name, city, totalIncome);
    company.showInfoModal();
  }

  clearInput() {
    const filterNameInput = document.querySelector("input[type=text]");
    filterNameInput.value = "";
    this.filterNames();
  }

  closeTable() {
    let container = document.querySelector(".container");
    container.style.setProperty("display", "none");
  }
}

export default Table;
