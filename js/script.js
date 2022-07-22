function Request(url, result) {
    const oReq = new XMLHttpRequest();
    oReq.onload = function () {
        result(JSON.parse(this.responseText));
    };
    oReq.open("get", url, true);
    oReq.send();
    return result;
}

const activeName = 'active';
const displayNone = 'd-none';
const displayBlock = 'd-block';

const perLoader = document.querySelector('.preloader');

// TABLES TR
const oneTable = document.getElementById('one-table');
const twoTable = document.getElementById('two-table');

// TABLES BLOCK TD
const oneTableBlock = document.getElementById('one-table-block');
const twoTableBlock = document.getElementById('two-table-block');

const experienceSeriesBlock = document.getElementById('experience-series-block');
const activityTypeExp = 'Experience Series';

const showMore = document.getElementById('show_more');

oneTable.onclick = () => {
    oneTable.classList.add(activeName);
    twoTable.classList.remove(activeName);

    oneTableBlock.classList.remove(displayNone);
    oneTableBlock.classList.add(displayBlock);

    twoTableBlock.classList.remove(displayBlock);
    twoTableBlock.classList.add(displayNone);
}

twoTable.onclick = () => {
    twoTable.classList.add(activeName);
    oneTable.classList.remove(activeName);

    oneTableBlock.classList.add(displayNone);
    oneTableBlock.classList.remove(displayBlock);

    twoTableBlock.classList.add(displayBlock);
    twoTableBlock.classList.remove(displayNone);
}

const TuDay = moment().format('YYYY-MM-DD');
const urlData = `https://api.quicksteps.com.au/api/v2/null/qs-website/${TuDay}`;
const urlDataForTable = `https://api.quicksteps.com.au/api/v2/null/qs-website-timetable/${TuDay}`;

const dayMonths = {
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    web: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat'
}

const levelNames = {
    foundations1: 'Level 1',
    foundations2: 'Level 2',
    specialist: 'Specialist',
    open: 'Level 3',
    socialEvents: 'Social Events',
    all: 'All'
}

function levelBlock(catName, danceName) {
    switch (catName) {
        case levelNames.foundations1:
            return `<div class="foundation__1">${danceName}</div>`;
        case levelNames.foundations2:
            return `<div class="foundation__2">${danceName}</div>`;
        case levelNames.specialist:
            return `<div class="specialist">${danceName}</div>`;
        case levelNames.open:
            return `<div class="open">${danceName}</div>`;
        case levelNames.socialEvents:
            return `<div class="social-events">${danceName}</div>`;
        case levelNames.all:
            return `<div class="all__levels">${danceName}</div>`;
        default:
            return '';
    }
}

function retVal(mont, monthName) {
    let res = '';
    mont.map((table) => {
        const data = moment(changeData(table.date)).format('ddd');
        const level = table.level;
        const danceName = table.dance;
        const result = data === monthName ? levelBlock(level, danceName) : '';
        res = res + result
    })
    return res;
}

let showMoreCount = 7; // THIS VAR FOR SHOW MORE COUNT
let allQuArray = [];

Request(urlDataForTable, function (res) {
    allQuArray = res.data;
    startAppendTables();
});

showMore.addEventListener('click', function (){
    showMoreCount += 7;
    startAppendTables();
})


const studiosBlock = document.querySelector('.studios');
const btnInformation = [];

Request(urlData, function (res) {
    console.log(res)
    res?.studios?.forEach((st, index) => {
        if (!Array.isArray(st?.currentExpSeries)) {
            const elem = document.createElement('button');
            elem.classList.add('btn');
            elem.classList.add('private-lesson');
            elem.classList.add('top__studios__btn');
            elem.id = index;
            elem.innerHTML = `${st.name}<small class="d-block">${st.street}</small>`;
            studiosBlock.appendChild(elem);

            btnInformation.push({
                id: index,
                obj: st
            })
        }
    })

    UpdateTableInformation();

  setTimeout(() => {
    perLoader.classList.add('close')
  }, 1000)
});


function UpdateTableInformation() {
    // startCalc(oneTableBlock, JSON.parse(array));

    if (!Array.isArray(btnInformation[0].obj.nextExpSeries)) {
        twoTable.classList.remove(displayNone);
        changeTableInformation(
            twoTableBlock,
            twoTable,
            btnInformation[0].obj.nextExpSeries.activities,
            btnInformation[0].obj.nextExpSeries
        )
    }

    changeTableInformation(
        oneTableBlock,
        oneTable,
        btnInformation[0].obj.currentExpSeries.activities,
        btnInformation[0].obj.currentExpSeries
    )


    const topStudiosBtn = document.querySelectorAll('.top__studios__btn');
    topStudiosBtn.forEach((item) => {
        item.addEventListener('click', function () {
            const elmId = +this.id;
            const currentInfo = btnInformation.find((_i) => _i.id === elmId);

            document.querySelectorAll('.table-td').forEach((item) => {
                item.outerHTML = '';
            })


            changeTableInformation(
                oneTableBlock,
                oneTable,
                currentInfo.obj.currentExpSeries.activities,
                currentInfo.obj.currentExpSeries
            )

            if (!Array.isArray(currentInfo.obj.nextExpSeries)) {
                twoTable.classList.remove(displayNone);
                changeTableInformation(
                    twoTableBlock,
                    twoTable,
                    currentInfo.obj.nextExpSeries.activities,
                    currentInfo.obj.nextExpSeries
                )
            }
        })
    })
}


function changeTableInformation(table, tableTitle, activities, ExpSeries) {
    startCalc(table, activities);
    tableTitle.innerHTML = addDataTableBlock(ExpSeries);
}


function addDataTableBlock(data) {
    return `${moment(data.startDate).format('MMMM DD')} - ${moment(data.endDate).format('MMMM DD')}`;
}

function startCalc(appendingBlock, array) {
    let currentArray = [];
    let oneTableArray = [...array].sort((a,b) => a.time.split(':')[0] - b.time.split(':')[0])
    filterArr(oneTableArray);
    function filterArr(array){
        if(array.length){
            const newProd = array.filter((dance) => dance.time === array[0].time);
            currentArray.push(newProd)
            const emptyProd = array.filter((dance) => dance.time !== array[0].time);
            filterArr(emptyProd);
        }
    }

    // console.log(currentArray.sort((a,b) => a[0].time - b[0].time), 11111111111)
    currentArray.map((times) => {
        const data = `${changeData(times[0]?.date)} ${times[0]?.time}:00`;
        appendFunction(appendingBlock, times, data)
    })
}




function startAppendTables() {
    experienceSeriesBlock.innerHTML = '';
    let currentArrayForTables = [];
    let bottomTables = [...allQuArray]
        .sort((a, b) => moment(a.date).unix() - moment(b.date).unix());


    const dates = [];
    bottomTables.forEach((e) => {
        const viewDates = dates.some((arrDates) => arrDates === e.date);
        if (!viewDates) {
            dates.push(e.date)
        }
    })


    dates.forEach((data) => {
        const tables = bottomTables.filter((dance) => dance.date === data);
        currentArrayForTables.push(tables);
    })
    if(showMoreCount > currentArrayForTables.length){
        showMore.classList.add(displayNone)
    }

    function appendTable(tables) {
        let result = '';
        tables.forEach((table) => {
            const data = `${changeData(table.date)} ${table.time}`;
            const expSeries = table.activityType;
            result = result + `
                <div class="dance-item-block">
                    <div class="inf-block">
                        <div class="inf-it-1">
                            <div class="round ${expSeries === activityTypeExp ? 'blue' : 'yellow'}"></div>
                            <div class="time">${window.moment(data).format('LT')}</div>
                            <span class="name-studio">${table.studio.name}</span>
                            <div class="name">${table.activityType} ${table.dance} ${table.level}</div>
                        </div>
                        ${table.showOnOgb === 1 ? `<a href="https://www.quicksteps.com.au/ogb?activity=${table.id}" class="free-button">try for free</a>` : ''}
                    </div>
                </div>
            `
        })
        return result;
    }

    currentArrayForTables.forEach((tables, index) => {
        if(index <= showMoreCount){
            const startDate = moment(`${changeData(tables[0]?.date)} ${tables[0]?.time}`).format();
            const EndDate = moment(`${changeData(tables[tables.length - 1]?.date)} ${tables[tables.length - 1]?.time}`).format();


            experienceSeriesBlock.insertAdjacentHTML('beforeend', `
                <div class="experience-series-tables">
                    <div class="dance-title-block">
                         ${window.moment(startDate).format('dddd')}, ${moment(EndDate).format('dddd')} ${moment(EndDate).format('MMMM DD')}
                    </div>
                    <div class="e__s__b">
                        ${appendTable(tables)}
                    </div>
                </div>
            `)
        }
    })
}

function changeData(data) {
    const slData = data.split('-');
    return `${slData[0]}-${slData[1]}-${slData[2]}`;
}

function appendFunction(currentBlock, times, data) {
    // console.log(data)
    currentBlock.insertAdjacentHTML('beforeend', `
            <div class="table-td">
                <div class="table-item">${window.moment(data).format('LT')}</div>
                <div class="table-item">
                    ${retVal(times, dayMonths.sun)}
                </div>
                <div class="table-item">
                    ${retVal(times, dayMonths.mon)}
                </div>
                <div class="table-item">
                   ${retVal(times, dayMonths.tue)}
                </div>
                <div class="table-item">
                    ${retVal(times, dayMonths.web)}
                </div>
                <div class="table-item">
                    ${retVal(times, dayMonths.thu)}
                </div>
                <div class="table-item">
                   ${retVal(times, dayMonths.fri)}
                </div>
                <div class="table-item">
                    ${retVal(times, dayMonths.sat)}
                </div>
            </div>
        `)
}
