const totalLifts = document.getElementById("totalLifts");
const totalFloors = document.getElementById("totalFloors");
const liftSimulator = document.getElementById("liftSimulator");
const DOMlifts = document.getElementById("lifts");
const DOMfloors = document.getElementById("floors");
let count = 0, i = 0;
let groundLiftHeight = 0;
let liftData = [];

class PriorityStatus {
    constructor() {
        this.queue = [];
    }

    enqueue(item, priority) {
        this.queue.push({ item, priority })
        this.sort();
    }

    dequeue() {
        if (this.isEmpty())
            return null;

        return this.queue.shift().item;
    }

    isEmpty() {
        return this.queue.length === 0
    }

    sort() {
        this.queue.sort((a, b) => a.priority - b.priority);
    }
}


const generateFloors = (getFloors) => {
    const floors = Array.from(Array(getFloors).keys());

    DOMfloors.innerHTML = "";
    for (idx = floors.length - 1; idx >= 0; idx--) {
        const singleFloor = document.createElement('div');
        singleFloor.classList.add("single-floor");

        const up = document.createElement("button");
        up.setAttribute("data-id", `${idx}-up`);
        up.setAttribute("data-floor", idx);
        up.textContent = "up";

        const down = document.createElement("button");
        down.setAttribute("data-id", `${idx}-down`);
        down.setAttribute("data-floor", idx);
        down.textContent = "down";

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

        up.addEventListener("click", (e) => {
            const liftCalledAt = parseInt(e.target.getAttribute("data-floor"))
            const callAtFloor = callLift(liftCalledAt);
            moveLift(callAtFloor, liftCalledAt);
        })
        down.addEventListener("click", e => {
            const liftCalledAt = parseInt(e.target.getAttribute("data-floor"))
            const callAtFloor = callLift(liftCalledAt);
            moveLift(callAtFloor, liftCalledAt);
        })
        DOMfloors.appendChild(singleFloor)

    }
}


const generateLifts = (getLifts) => {
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

// const moveLifts = buttonCall => {
//     const singleLifts = document.getElementsByClassName("single-lift");
//     const liftLeftDoor = document.getElementsByClassName("left-door");
//     const liftRightDoor = document.getElementsByClassName("right-door");
//     const floors = Object.values(document.getElementsByClassName("single-floor"))
//     const { top } = singleLifts[i].getBoundingClientRect();
//     const liftDistaceFromTop = DOMfloors.offsetHeight - singleLifts[i].offsetHeight;
//     const buttonDistanceFromTop = buttonCall.offsetTop - 32;
//     let floorLevel = buttonDistanceFromTop - liftDistaceFromTop;
//     let levelOnTop;

//     if (buttonCall.getAttribute("data-id")) {
//         levelOnTop = buttonCall.getBoundingClientRect().top - 32;

//         if (buttonCall.getAttribute("data-id").includes("down") && buttonCall.getAttribute("data-id") !== `${floors.length - 1}-down`) {
//             floorLevel = floorLevel - 64;
//             levelOnTop = buttonCall.getBoundingClientRect().top - 32 - 65;
//         }

//         if (buttonCall.getAttribute("data-id") === `${floors.length - 1}-down` || buttonCall.getAttribute("data-id") === `0-up`) {
//             levelOnTop = levelOnTop - 1;
//         }
//     }

//     if (levelOnTop !== top) {
//         singleLifts[i].style.position = "relative";
//         singleLifts[i].style.top = `${floorLevel}px`;
//         liftLeftDoor[i].style.animation = "";
//         liftRightDoor[i].style.animation = "";
//         setTimeout(() => {
//             liftLeftDoor[i].style.animation = "openCloseDoorsleft 2s forwards"
//             liftRightDoor[i].style.animation = "openCloseDoorsright 2s forwards"
//             if (i !== singleLifts.length - 1) {
//                 i++;
//             } else {
//                 i = 0;
//             }
//         }, 2000)
//     }
//     else {
//         i = 0;
//     }
// }

// document.addEventListener("click", (e) => {
//     if (e.target.hasAttribute("data-id")) moveLifts(e.target);
// })

const generateDOM = e => {
    if (e.key === "Enter") {
        lifts = Number(totalLifts.value)
        floors = Number(totalFloors.value)
        if (lifts > 10 || floors > 10 || lifts <= 0 || floors <= 0) return alert("Entered value must be between 0 and 10");
        generateFloors(floors)
        generateLifts(lifts)
        const singleLifts = document.getElementsByClassName("single-lift");
        groundLiftHeight = singleLifts[0].getBoundingClientRect().top;
    }
}


totalFloors.addEventListener("keydown", (e) => generateDOM(e))
totalLifts.addEventListener("keydown", (e) => generateDOM(e))

function callLift(liftNumber) {
    const newQueue = new PriorityStatus();

    for (let i = 0; i < liftData.length; i++) {
        const lift = liftData[i];
        if (!lift.isMoving) {
            const diff = Math.abs(liftNumber - lift.currentFloor);
            newQueue.enqueue(i, diff);
            // console.log(newQueue.queue);
        }
        else if (lift.currentFloor === liftNumber) return i;
    }
    return newQueue.dequeue();
}

function moveLift(liftNumber, floorNumber) {
    const lift = liftData[liftNumber];
    const liftElement = document.getElementById(liftNumber);
    console.log(liftNumber, liftElement);
    const newPosition = floorNumber * 160 + floorNumber;
    const timer = 2000;

    lift.isMoving = true;
    liftElement.style.transform = `translateY(-${newPosition}px)`;
    liftElement.style.transition = `transform ${timer}ms linear`;
    lift.position = newPosition;
    lift.currentFloor = floorNumber;

    setTimeout(() => {
        liftElement.classList.add("openDoors");
    }, timer)
    setTimeout(() => {
        lift.isMoving = false;
        liftElement.classList.remove("openDoors");
    }, timer + 4000)

    // console.log(lift.isMoving, timer+4000);


}