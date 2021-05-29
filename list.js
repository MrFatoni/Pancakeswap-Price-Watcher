function load(){
	let str = localStorage.getItem("list")
	if (str == null) {
		str = "0xe9e7cea3dedca5984780bafc599bd69add087d56 1000"
	}

	let element = document.getElementById("tokenlist")
	element.value = str.toString().replaceAll("," ,"\n")
}

function submit(){
	let element = document.getElementById("tokenlist")
	let str = element.value
	let arr = str.split('\n')

	localStorage.setItem("list", arr)
}
