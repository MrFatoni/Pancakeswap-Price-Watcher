function get(quote){
	let ret = fetch('https://graphql.bitquery.io/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query:
`{
	ethereum(network: bsc) {
		dexTrades(
			options: {limit: 1, desc: "timeInterval.minute"}
			date: {since: "2021-01-01"}
			exchangeName: {is: "Pancake"}
			baseCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
			quoteCurrency: {is: "${quote}"}
		) {
		timeInterval {
			minute(count: 5)
		}
		baseCurrency {
			symbol
		}
		baseAmount
		quoteCurrency {
			symbol
			address
		}
		quoteAmount
		trades: count
		quotePrice
		maximum_price: quotePrice(calculate: maximum)
		minimum_price: quotePrice(calculate: minimum)
		open_price: minimum(of: block, get: quote_price)
		close_price: maximum(of: block, get: quote_price)
		}
	}
}`,
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		let data = result["data"]["ethereum"]["dexTrades"][0]
		console.log(data)
		let now = data["timeInterval"]["minute"] + " UTC"

		let basetick = data["baseCurrency"]["symbol"]
		let quotetick = data["quoteCurrency"]["symbol"]

		let quoteaddress = data["quoteCurrency"]["address"]

		let quoteprice = data["close_price"]

		return {
			"time": now,
			"baseTick": basetick,
			"quoteTick": quotetick,
			"quotePrice": quoteprice,
			"quoteAddress": quoteaddress }
	});
	return ret
}

rounding = -1
function rnd(v) {
	return v
	return v.toPrecision(5)
	if (rounding == -1)
		return v

	str = v.toString()

	// count
	comma = false
	leading = 0
	for (let i = 0; i < str.length; i++){
		if(str[i] == "0"){
			leading++
		} else if (str[i] != "." && str[i] != ",") {
			leading++
			break
		}
	}

	// make
	places = rounding+leading
	out = ""
	for (let i = 0; i < str.length; i++){
		if(str[i] == "." || str[i] == ",")
			comma = true
		if(i < places)
			out += str[i]
		else if (!comma)
			out += "0"
	}
	return out
}

function format(data, ownCount){
	let time = data["time"]
	let baseTick = data["baseTick"]
	let quoteTick = data["quoteTick"]
	let quotePrice = rnd(data["quotePrice"])
	let quoteAddress = data["quoteAddress"]

	let ownWorth = rnd(ownCount/quotePrice)

	//let text = `<div class="status"><span class="titlebar">As of <time>${time}</time></span><br>1 ${baseTick} = ${quotePrice} ${quoteTick}<br>${ownWorth} ${baseTick} = ${ownCount} ${quoteTick}</div>`
	let text = `<div class="status"><span class="titlebar">As of <time>${time}</time></span>
<br>
<a href="http://bscscan.com/address/${quoteAddress}">BSCScan</a>
&nbsp;
<a href="https://exchange.pancakeswap.finance/#/swap?inputCurrency=${quoteAddress}&outputCurrency=BNB">Pancake</a>
&nbsp;
<a href="https://poocoin.app/tokens/${quoteAddress}">Poocoin</a>
&nbsp;
<a href="https://charts.bogged.finance/?token=${quoteAddress}">Bogged</a>
<br>
<table>
	<tr>
		<th>${baseTick}</th>
		<th>${quoteTick}</th>
	</tr>
	<tr>
		<td>1</td>
		<td>${quotePrice}</td>
	</tr>
	<tr>
		<td>${ownWorth}</td>
		<td>${ownCount}</td>
	</tr>
</table>
<br>`
	return text
}

let list = []
function load(){
	list = []

	let str = localStorage.getItem("list")
	if (str == null) {
		str = "0xe9e7cea3dedca5984780bafc599bd69add087d56 1000"
	}
	let arr = str.split(',')

	arr.forEach(function (v){
		let x = v.split(" ")
		if (x.length == 2 && x[0].length == 42) {
			let y = [x[0], x[1]]
			list.push(y)
		}
	})
	console.log(list)

	refresh()
}

function refresh(){
	let element = document.getElementById("shit")
	let done = Array(list.length)
	element.innerHTML = ""

	// makes sure we get them in the same order every time
	function gen(){
		element.innerHTML = ""
		done.forEach(function(v){
			if (v != null){
				element.innerHTML += v
			}
		})
	}

	list.forEach(function (v, i){
		get(v[0]).then(x => {
			z = format(x, v[1])
			done[i] = z
			gen()
		})
	})
}
