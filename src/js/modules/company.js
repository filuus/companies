import Table from "./table.js";

class Company {
  constructor(id, name, city, totalIncome) {
    this.id = id;
    this.name = name;
    this.city = city;
    this.totalIncome = totalIncome;
  }

  init() {
    return new Promise((resolve, reject) => {
      fetch(`https://recruitment.hal.skygate.io/incomes/${this.id}`)
        .then(response => response.json())
        .then(response => {
          this.incomes = response.incomes.map(el => {
            return {
              value: el.value,
              date: Date.parse(el.date),
              month: new Date(Date.parse(el.date)).getMonth() + 1,
              year: new Date(Date.parse(el.date)).getFullYear()
            };
          });
          this.incomesPerMonth = {};
          this.incomes.forEach(elem => {
            const data = `${elem.year}-${
              elem.month < 10 ? "0" + elem.month : elem.month
            }`;
            if (data in this.incomesPerMonth) {
              this.incomesPerMonth[data] += parseFloat(elem.value);
            } else {
              this.incomesPerMonth[data] = parseFloat(elem.value);
            }
          });
          this.averageIncome = this.calcAverageIncome();
          const today = new Date();
          let firstDayOfYear = new Date(today.getFullYear(), 1, 1);
          let firstDayOfPrevMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          let lastDayOfPrevMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );
          firstDayOfPrevMonth = firstDayOfPrevMonth.getTime();
          lastDayOfPrevMonth = lastDayOfPrevMonth.getTime();
          this.filterDate();
          this.lastMonthIncome = this.clacTotalIncome(
            firstDayOfPrevMonth,
            lastDayOfPrevMonth
          ).sum;
          document.querySelector(
            "#startDate"
          ).value = `${firstDayOfYear.getFullYear() - 1}-01`;
          document.querySelector("#endDate").value = `${today.getFullYear()}-${
            today.getMonth() + 1 < 10
              ? "0" + (today.getMonth() + 1)
              : today.getMonth() + 1
          }`;
          this.getPeriodStat();
          resolve("done");
        });
    });
  }

  getData() {
    return new Promise((resolve, reject) => {
      fetch(
        `https://recruitment.hal.skygate.io/incomes/${this.id}`
      ).then(response => resolve(response));
    });
  }

  getTotalIncome() {
    return new Promise((resolve, reject) => {
      this.getData()
        .then(response => response.json())
        .then(response => {
          const sum = response.incomes.reduce((prev, current) => {
            return prev + parseFloat(current.value);
          }, 0);
          resolve(sum);
        });
    });
  }

  clacTotalIncome(startData, endData) {
    let total = 0;
    let months = 0;
    const start = startData || 0;
    const end = endData || new Date().getTime();
    for (const key in this.incomesPerMonth) {
      if (Date.parse(key) >= start && Date.parse(key) <= end) {
        total += this.incomesPerMonth[key];
        months++;
      }
    }
    return { sum: total.toFixed(2), numberOfMonths: months };
  }

  calcAverageIncome(startData, endData) {
    const start = startData || 0;
    const end = endData || new Date().getTime();
    const income = this.clacTotalIncome(start, end);
    return (income.sum / income.numberOfMonths).toFixed(2);
  }

  showInfoModal() {
    const mainContainer = document.querySelector("body");
    const modal = document.createElement("div");
    modal.classList.add("modal");
    mainContainer.appendChild(modal);
    const closeButton = document.createElement("span");
    closeButton.innerHTML = `<i class="fas fa-times"></i>`;
    closeButton.classList.add("close");
    closeButton.addEventListener("click", this.closeInfoModal.bind(this));
    modal.appendChild(closeButton);
    const up = document.createElement("div");
    up.classList.add("up");
    modal.appendChild(up);
    const down = document.createElement("div");
    down.classList.add("down");
    modal.appendChild(down);
    const name = document.createElement("h1");
    name.classList.add("name");
    name.classList.add("title");
    name.innerHTML = `<span>Name: </span><span>${this.name}</span>`;
    up.appendChild(name);
    const city = document.createElement("h2");
    city.classList.add("city");
    city.classList.add("title");
    city.innerHTML = `<span>City: </span><span>${this.city}</span>`;
    up.appendChild(city);
    const totalIncome = document.createElement("h3");
    totalIncome.classList.add("total-income");
    totalIncome.classList.add("title");
    totalIncome.innerHTML = `<span>Total income: </span><span>${this.totalIncome}</span>`;
    up.appendChild(totalIncome);
    const dateSection = document.createElement("div");
    dateSection.classList.add("date-section");
    down.appendChild(dateSection);
    const startSection = document.createElement("div");
    startSection.classList.add("start-section");
    const startDateLabel = document.createElement("label");
    startDateLabel.for = "startDate";
    startDateLabel.innerText = "Start date:";
    startSection.appendChild(startDateLabel);
    const startDate = document.createElement("input");
    startDate.id = "startDate";
    startDate.type = "month";
    startSection.appendChild(startDate);
    dateSection.appendChild(startSection);
    const endSection = document.createElement("div");
    endSection.classList.add("end-section");
    const endDateLabel = document.createElement("label");
    endDateLabel.for = "endtDate";
    endDateLabel.innerText = "End date:";
    endSection.appendChild(endDateLabel);
    const endDate = document.createElement("input");
    endDate.id = "endDate";
    endDate.type = "month";
    endSection.appendChild(endDate);
    dateSection.appendChild(endSection);
    const button = document.createElement("button");
    button.innerText = "Check";
    button.addEventListener("click", this.getPeriodStat.bind(this));
    dateSection.appendChild(button);
    const periodStat = document.createElement("div");
    periodStat.classList.add("period");
    down.appendChild(periodStat);
    this.init().then(response => {
      const average = document.createElement("p");
      average.classList.add("average");
      average.classList.add("title");
      average.innerHTML = `<span>Average income: </span><span>${this.averageIncome}</span>`;
      up.appendChild(average);
      const lastMonth = document.createElement("p");
      lastMonth.classList.add("last-month");
      lastMonth.classList.add("title");
      lastMonth.innerHTML = `<span>Last month income: </span><span>${this.lastMonthIncome}</span>`;
      up.appendChild(lastMonth);
    });
    window.addEventListener("resize", this.getPeriodStat.bind(this));
  }

  closeInfoModal() {
    window.removeEventListener("resize", this.getPeriodStat);
    const modal = document.querySelector(".modal");
    const container = document.querySelector(".container");
    modal.remove();
    container.style.setProperty("display", "block");
  }

  filterDate(startData, endData) {
    this.filteredIncomes = [];
    const start = startData || 0;
    const end = endData || new Date().getTime();
    for (const key in this.incomesPerMonth) {
      this.filteredIncomes.push({
        date: key,
        value: this.incomesPerMonth[key]
      });
    }
    this.filteredIncomes.sort((a, b) => {
      return Date.parse(a.date) - Date.parse(b.date);
    });
    this.filteredIncomes = this.filteredIncomes.filter(el => {
      return Date.parse(el.date) >= start && Date.parse(el.date) <= end;
    });
  }

  getDate() {
    const start = Date.parse(document.querySelector("#startDate").value);
    const end = Date.parse(document.querySelector("#endDate").value);
    return { start: start, end: end };
  }

  getCanvas(destination) {
    const downSection = document.querySelector(".down");
    let width = 0.9 * downSection.offsetWidth;
    width = width.toString();
    const canvas = document.createElement("canvas");
    canvas.id = "graph";
    canvas.width = width;
    canvas.height = "150";
    destination.appendChild(canvas);
    const max = this.filteredIncomes.reduce((acc, current) => {
      return Math.max(acc, current.value);
    }, 0);
    const ratio = (parseFloat(canvas.height) - 10) / max;
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
      ctx.translate(0, 150);
      ctx.scale(1, -1);
      ctx.fillStyle = "white";
      this.filteredIncomes.forEach((element, index, array) => {
        const x = index * (parseFloat(canvas.width) / array.length);
        const width = parseFloat(canvas.width) / (2 * array.length);
        const height = element.value * ratio;
        ctx.fillRect(x, 0, width, height);
      });
    }
  }

  getPeriodStat() {
    const downSection = document.querySelector(".down");
    let periodStat = document.querySelector(".period");
    periodStat.remove();
    periodStat = document.createElement("div");
    periodStat.classList.add("period");
    downSection.appendChild(periodStat);
    const start = this.getDate().start;
    const end = this.getDate().end;
    const periodAverage = document.createElement("p");
    periodAverage.classList.add("title");
    periodAverage.innerHTML = `<span>Average income during period: </span><span>${this.calcAverageIncome(
      start,
      end
    )}</span>`;
    periodStat.appendChild(periodAverage);
    const periodIncome = document.createElement("p");
    periodIncome.classList.add("title");
    periodIncome.innerHTML = `<span>Total income during period: </span><span>${
      this.clacTotalIncome(start, end).sum
    }</span>`;
    periodStat.appendChild(periodIncome);
    this.filterDate(start, end);
    this.getCanvas(periodStat);
  }
}

export default Company;
