const totalLifts = document.getElementById("totalLifts");
const totalFloors = document.getElementById("totalFloors");
const liftSimulator = document.getElementById("liftSimulator");
const DOMlifts = document.getElementById("lifts");
const DOMfloors = document.getElementById("floors");
const submit = document.getElementById("submit");
let liftData = [], queueStack = [], enableButtons = [];
let newQueue = [...liftData];

submit.addEventListener("click", generateDOM)
totalFloors.addEventListener("keydown", (e) => (e.key === "Enter") && generateDOM())
totalLifts.addEventListener("keydown", (e) => (e.key === "Enter") && generateDOM())

function generateDOM() {
    liftData = [];
    queueStack = [];
    newQueue = [...liftData];
    enableButtons = [];
    lifts = Number(totalLifts.value)
    floors = Number(totalFloors.value)
    if (lifts > 10 || floors > 10 || lifts <= 0 || floors <= 0) return alert("Entered value must be between 0 and 10");
    if (lifts > floors) return alert("Number of lifts should be less than number of floors");
    generateFloors(floors)
    generateLifts(lifts)
}

function generateFloors(getFloors) {
    const floors = Array.from(Array(getFloors).keys());

    DOMfloors.innerHTML = "";
    for (idx = floors.length - 1; idx >= 0; idx--) {
        const singleFloor = document.createElement('div');
        singleFloor.classList.add("single-floor");

        const up = document.createElement("button");
        up.setAttribute("data-id", `${idx}-up`);
        up.setAttribute("data-floor", idx);
        up.setAttribute("class", "material-symbols-outlined")
        up.textContent = "arrow_upward";

        const down = document.createElement("button");
        down.setAttribute("data-id", `${idx}-down`);
        down.setAttribute("data-floor", idx);
        down.setAttribute("class", "material-symbols-outlined")
        down.textContent = "arrow_downward";

        if (idx === 0) {
            singleFloor.appendChild(up);
        }
        else if (idx === floors.length - 1) {
            singleFloor.appendChild(down);
        }
        else {
            singleFloor.appendChild(up);
            singleFloor.appendChild(down);
        }

        up.addEventListener("click", (e) => getThoseLifts(e))
        down.addEventListener("click", e => getThoseLifts(e))
        DOMfloors.appendChild(singleFloor)

    }
}

function generateLifts(getLifts) {
    const lifts = Array.from(Array(getLifts).keys());

    DOMlifts.innerHTML = "";
    lifts.map((_, idx) => {
        const singleLift = document.createElement('div');
        singleLift.classList.add("single-lift");
        singleLift.setAttribute("id", idx)
        DOMlifts.appendChild(singleLift)
        liftData.push({
            id: idx,
            isMoving: false,
            currentFloor: 0,
            position: 0
        })
    })
}

function getThoseLifts(e) {
    const liftCalledAt = parseInt(e.target.getAttribute("data-floor"))
    const getButtons = document.querySelectorAll(`[data-floor="${liftCalledAt}"]`)
    Object.values(getButtons).map(item => item.setAttribute("disabled", "true"));
    moveLift(liftCalledAt, getButtons);
}

function moveLift(floorNumber, getButtons) {
    let availableLift = liftData.filter(item => !item.isMoving);
    const getNearestLift = availableLift.reduce((acc, curr) => {
        const diff = Math.abs(floorNumber - curr.currentFloor);
        const accDiff = Math.abs(floorNumber - acc.currentFloor);
        let myLift;
        (diff < accDiff) ? myLift = curr : myLift = acc;
        return myLift;
    }, availableLift[0]);

    if (liftData.find(item => item.currentFloor === floorNumber)) {
        const liftElement = liftData.find(item => item.currentFloor === floorNumber);
        const newPromise = new Promise((res, _) => {
            res(liftElement.classList.add("openDoors"));
        })
        newPromise.then(() => liftElement.classList.remove("openDoors"))
            .then(() => {
                Object.values(getButtons).map(item => item.removeAttribute("disabled"))
                return;
            })
    };

    if (availableLift.length === 0) {
        if (newQueue.length === 0) newQueue = [...liftData];
        const noLiftFree = newQueue.reduce((acc, curr) => {
            const diff = Math.abs(floorNumber - curr.currentFloor);
            const accDiff = Math.abs(floorNumber - acc.currentFloor);
            let myLift;
            (diff < accDiff) ? myLift = curr : myLift = acc;
            return myLift;
        })

        newQueue = newQueue.filter(item => item.id !== noLiftFree.id);

        queueStack.push({ floor: floorNumber, lift: noLiftFree.id, diff: Math.abs(floorNumber - noLiftFree.currentFloor) });
        queueStack.sort((a, b) => a.diff - b.diff);
        enableButtons.push(getButtons);
    } else {
        queueStack.push({ floor: floorNumber, lift: getNearestLift.id, diff: Math.abs(floorNumber - getNearestLift.currentFloor) });
        queueStack.sort((a, b) => a.diff - b.diff);
        callLift(getNearestLift, getButtons);
    }

}

function callLift(nearestLift, getButtons) {
    const lift = liftData.find(item => item.id === nearestLift.id);
    const liftElement = document.getElementById(lift.id);
    const floorNumber = queueStack.filter(item => item.lift === lift.id).shift().floor;
    const newPosition = floorNumber * 160 + floorNumber;
    const timer = Math.abs(floorNumber - lift.currentFloor) * 2000;
    lift.isMoving = true;
    lift.position = newPosition;
    lift.currentFloor = floorNumber;

    console.log(queueStack);

    liftElement.style.transform = `translateY(-${newPosition}px)`;
    liftElement.style.transition = `transform ${timer}ms linear`;
    const newPromise = new Promise((res, _) => {
        setTimeout(() => {
            res(liftElement.classList.add("openDoors"));
        }, timer)
    })

    if (queueStack[0].lift === lift.id) queueStack.shift()
    else return;

    newPromise.then(() => {
        setTimeout(() => {
            lift.isMoving = false;
            liftElement.classList.remove("openDoors");
            if (getButtons) Object.values(getButtons).map(item => item.removeAttribute("disabled"));
            if (queueStack.length !== 0) {
                callLift(nearestLift);
                if (enableButtons.length !== 0) {
                    let buttons = enableButtons.shift();
                    Object.values(buttons).map(item => item.removeAttribute("disabled"));
                }
            }
        }, 4000)
    })
}