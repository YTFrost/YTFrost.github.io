class UnitBranch {
	max = 0;
	units = [];
	unitCounter = new Map();
	unitLimits = new Map();
	DOMElement = undefined;
	constructor(branchObject){
		this.max = branchObject.max;
		const allowedTypes = [];
		
		if(Array.isArray(branchObject.of)){
			for(const type of branchObject.of){
				allowedTypes.push(type.of);
				this.unitLimits.set(type.of, type.max);
				this.unitCounter.set(type.of, 0);
			}	
		}
		else{
			allowedTypes.push(branchObject.of);
			this.unitLimits.set(branchObject.of, branchObject.max);
			this.unitCounter.set(branchObject.of, 0);
		}

		for(let i = 0; i<this.max; i++){
			const newUnit = new Unit;
			newUnit.allowedTypes = allowedTypes;
			this.units.push(newUnit);
		}
	};
	getHTML(){
		const unitBranch = document.createElement("div");
		unitBranch.classList.add("unitBranch");

		const unitsList = document.createElement("div");
		unitBranch.appendChild(unitsList);
		unitsList.classList.add("unitsList");

		const unitLimitsFooter = document.createElement("footer");
		unitBranch.appendChild(unitLimitsFooter);
		unitLimitsFooter.classList.add("unitLimitsFooter");

		for(const type of this.unitLimits.keys()){
			const unitLimit = document.createElement("p");
			unitLimitsFooter.appendChild(unitLimit);
			unitLimit.classList.add("unitLimit");
			unitLimit.innerHTML = 
				`${Unit.getCompanyName(type)}: 
				${this.unitCounter.get(type)}/${this.unitLimits.get(type)}`;
			if(this.unitCounter.get(type) == this.unitLimits.get(type)){
				unitLimit.classList.add("unitLimitMax");
			}
		}

		for(const unit of this.units){
			unitsList.appendChild(unit.getHTML());
		}

		this.DOMElement = unitBranch;
		return unitBranch;
	}
}

class Unit {
	name = "Unnamed Unit";
	type = "none";
	allowedTypes = [];
	subordinates = [];
	DOMElement = undefined;
	static getCompanyName(type){
		switch(type){
		case "reconnaissance":
			return "Reconnaissance Company";
		case "armored":
			return "Armored Company";
		case "artillery":
			return "Artillery Battery";
		case "airborne":
			return "Airborne Company";
		case "motorized":
			return "Motorized Company";
		case "mechanized":
			return "Mechanized Infantry Company";
		case "engineering":
			return "Combat Engineers Company";
		case "support":
			return "Combat Support Company";
		case "logistics":
			return "Logistics Company";
		default:
			return undefined;
		}
	};
	generateName(max, level){
		if(this.type == undefined) console.error("Can not generate name for unit with no type");
		else{
			let number = Math.random();
			number = Math.ceil(number*1000);
			if(max != undefined) number = number%max;
			switch(number%10){
			case 1:
				number = number+"st"
				break;
			case 2:
				number = number+"nd";
				break;
			case 3:
				number = number+"rd";
				break;
			default:
				number = number+"th";
				break;
			}

			switch(this.type){
			case "reconnaissance":
				this.name = number+" Reconnaissance "+level;
				break;
			case "armored":
				this.name = number+" Armored "+level;
				break;
			case "artillery":
				this.name = number+" Artillery "+level;
				break;
			case "airborne":
				this.name = number+" Airborne "+level;
				break;
			case "motorized":
				this.name = number+" Motorized Infantry "+level;
				break;
			case "mechanized":
				this.name = number+" Mechanized Infantry "+level;
				break;
			case "engineering":
				this.name = number+" Combat Engineers "+level;
				break;
			case "support":
				this.name = number+" Combat Support "+level;
				break;
			case "logistics":
				this.name = number+" Logistics "+level;
				break;
			default:
				console.error(`Unrecognized unit type: '${this.type}'`);
				break;
			}
		}
	};
	addSubordinates(subordinatesArray){
		for(const category of subordinatesArray){
			const unitBranch = new UnitBranch(category);
			this.subordinates.push(unitBranch);
		}
	};
	reset(){
		this.name = "Unnamed Unit";
		this.type = undefined;
		this.subordinates = [];
	};
	getHTML(){
		const unitContainer = document.createElement("div");
		unitContainer.classList.add("unitContainer");

		const unitHeader = document.createElement("header");
		unitContainer.appendChild(unitHeader);
		unitHeader.classList.add("unitHeader");

		const unitImage = document.createElement("img");
		unitHeader.appendChild(unitImage);

		const unitInfoContainer = document.createElement("div");
		unitHeader.appendChild(unitInfoContainer);
		unitInfoContainer.classList.add("unitInfoContainer");

		if(this.type != "none"){
			unitImage.src = `images/${this.type}.png`;
			unitImage.classList.add("unitImage");

			const unitName = document.createElement("p");
			unitInfoContainer.appendChild(unitName);
			unitName.classList.add("unitName");
			unitName.innerHTML = this.name;
			unitName.onclick = changeName;
		}
		else unitImage.classList.add("emptyUnitImage");

		if(this.allowedTypes.length > 0){
			const unitSelect = document.createElement("select");
			unitInfoContainer.appendChild(unitSelect);
			unitSelect.classList.add("unitSelect");
			unitSelect.onchange = unitSelectChange;

			const unitTypeNone = document.createElement("option");
			unitSelect.appendChild(unitTypeNone);
			unitTypeNone.value = "none";
			unitTypeNone.innerHTML = "No unit";

			for(const type of this.allowedTypes){
				const unitType = document.createElement("option");
				unitSelect.appendChild(unitType);
				unitType.value = type;
				unitType.innerHTML = Unit.getCompanyName(type);
			}

			unitSelect.value = this.type;
		}

		const unitSubordinates = document.createElement("div");
		unitContainer.appendChild(unitSubordinates);
		unitSubordinates.classList.add("unitSubordinates");

		for(const subordinate of this.subordinates){
			unitSubordinates.appendChild(subordinate.getHTML());
		};

		this.DOMElement = unitContainer;
		return unitContainer;
	};
}

const currentBrigade = new Unit;

const brigadeMap = {
	"reconnaissance": [
		{
			max: 7,
			of: [
				{
					max: 7,
					of: "motorized"
				},
				{
					max: 3,
					of: "mechanized"
				},
				{
					max: 1,
					of: "artillery"
				}
			]
		},
		{
			max: 2,
			of: [
				{
					max: 2,
					of: "engineering"
				},
				{
					max: 2,
					of: "support"
				}
			]
		},
		{
			max: 1,
			of: "logistics"
		}
	]
};

function newBrigade(){
	const main = document.getElementById("mainHierarchy");
	main.innerHTML = "";

	const brigadeType = document.getElementById("brigadeTypeSelect").value;

	currentBrigade.reset();
	currentBrigade.type = brigadeType;
	currentBrigade.generateName(1000, "Brigade");
	currentBrigade.addSubordinates(brigadeMap[brigadeType]);
	main.appendChild(currentBrigade.getHTML());
};

function clearBrigade(){
	currentBrigade.reset();
	document.getElementById("mainHierarchy").innerHTML = "";
};

function changeName(event){
	const currentName = event.target.innerHTML;
	event.target.outerHTML = `
		<input 
			type="text" 
			size=15 
			class="newUnitName" 
			id="newUnitName" 
			onchange="saveName()"
			value="${currentName}"
		>`;
};

function saveName(){
	let input = document.getElementById("newUnitName");
	const newName = input.value;
	input.outerHTML = `<p class="unitName" id="newUnitName">${newName}</p>`;
	input = document.getElementById("newUnitName");
	input.onclick = changeName;
	delete input.id;
};

function unitSelectChange(event){	
	// ELEMENT STRUCTURE:
	//> unitsBranch
	//> unitsList
	//> unitContainer
	//> unitHeader
	//> unitInfoContainer 
	//> event.target (select box)
	const newType = event.target.value;
	const unitContainer = event.target.parentNode.parentNode.parentNode;
	const unitsBranch = unitContainer.parentNode.parentNode;
	const branchObject = currentBrigade.subordinates.find((category) => category.DOMElement == unitsBranch);
	const unitObject = branchObject.units.find((unit) => unit.DOMElement == unitContainer);

	/*
	
	X = Previous type is NONE
	Y = New type is NONE
	
	X\Y| 0 | 1
	---|---|---
	 0 |ABC| AB
	---|---|---
	 1 | CB| /

	A = Count--
	B = Refresh
	C = Count++
	*/
	if(newType == "none" && unitObject.type == "none") return;
	if(unitObject.type != "none"){
		branchObject.unitCounter.set( 
			unitObject.type, 
			branchObject.unitCounter.get(unitObject.type) - 1 
		);
	};
	if(newType != "none"){
		if(branchObject.unitCounter.get(newType) == branchObject.unitLimits.get(newType)){
			window.alert(`You can not have more than ${branchObject.unitLimits.get(newType)} of ${Unit.getCompanyName(newType)} in this branch.`);
			event.target.value = "none";
			return;
		};
		branchObject.unitCounter.set( 
			newType, 
			branchObject.unitCounter.get(newType) + 1 
		);
	};
	unitObject.type = newType;
	unitObject.generateName(100, "Company");
	unitsBranch.parentNode.replaceChild(branchObject.getHTML(), unitsBranch);
};