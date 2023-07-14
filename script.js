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

const newQueue = new PriorityStatus();

function generateFloors(getFloors) {
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
            moveLift(callAtFloor, liftCalledAt, up);
           
        })
        down.addEventListener("click", e => {
            const liftCalledAt = parseInt(e.target.getAttribute("data-floor"))
            const callAtFloor = callLift(liftCalledAt);
            moveLift(callAtFloor, liftCalledAt, down);
        })
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

function generateDOM(e) {
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

    for (let i = 0; i < liftData.length; i++) {
        const lift = liftData[i];
        if (!lift.isMoving) {
            const diff = Math.abs(liftNumber - lift.currentFloor);
            newQueue.enqueue(i, diff);
            console.log(lift.isMoving);
            return newQueue.dequeue();
        }
        else if (lift.currentFloor === liftNumber) return i;
    }
}

// [1, 3, 4]

function moveLift(liftNumber, floorNumber, buttonCall) {
    const lift = liftData[liftNumber];
    lift.isMoving = true;
    const liftElement = document.getElementById(liftNumber);
    const newPosition = floorNumber * 160 + floorNumber;
    const timer = floorNumber === 0 ? lift.currentFloor * 2000 : 2000 * floorNumber;
    
    liftElement.style.transform = `translateY(-${newPosition}px)`;
    liftElement.style.transition = `transform ${timer}ms linear`;
    lift.position = newPosition;
    lift.currentFloor = floorNumber;
    buttonCall.setAttribute("disabled", "true")
    
    const openDoors = new Promise((resolve, _) => {
        setTimeout(() => {
            liftElement.classList.add("openDoors")
            resolve();
        }, timer)
    })

    openDoors.then(() => setTimeout(() => {
        lift.isMoving = false;
        liftElement.classList.remove("openDoors");
        buttonCall.removeAttribute("disabled");
        // if(!newQueue.isEmpty()) {
        //     newQueue.dequeue();
        // }

    }, 4000))
}