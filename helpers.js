function cleanPrice(price) {
	const match_dollar = /\$[0-9]+(\.[0-9][0-9])?/g;
	$.trim(price);
	let price_arr = price.match(match_dollar);
	if (price_arr) {
		price = price_arr[0].replace("$", "");
		return parseInt(price);
	}
	return 0;
}

function calculateAverage(service) {
	//price data item example:
	//{
	//best_buy_price : "$30 $399+ | $99 <$399",
	//home_depot_price : "Free",
	//lowes_price : "$29 $399+ | $79 <$399",
	//service : "Delivery Charges Updated 3/13/2024"
	//}

	data = JSON.parse(localStorage.getItem("price_data"));
	for (let i = 0; i < data.length; i++) {
		//get correct data element
		if (data[i].service == service) {
			let count = 0;

			const best_buy_price = cleanPrice(data[i].best_buy_price);
			if (best_buy_price != 0) {
				count++;
			}
			const home_depot_price = cleanPrice(data[i].home_depot_price);
			if (home_depot_price != 0) {
				count++;
			}
			const lowes_price = cleanPrice(data[i].lowes_price);
			if (lowes_price != 0) {
				count++;
			}

			const average = (best_buy_price + home_depot_price + lowes_price) / count;
			return Math.round(average);
		}
	}
}

function populateDifference(member_price_id, difference_id, average) {
	let member_input = document.getElementById(member_price_id);
	let difference_el = document.getElementById(difference_id);

	//if member inputs 0, difference is just the competitor average
	if (member_input.value == 0) {
		difference_el.innerText = "$" + average;
	}
	//if member inputs a non-zero value, difference is competitor average - member input
	if (member_input.value > 0) {
		difference = average - member_input.value;
		difference_el.innerText = "$" + difference;
	}
	if (!member_input.value) {
		difference_el.innerText = "";
	}
}

function calculateSum() {
	//get sum_display element defined in index.html
	const summed_data = document.getElementById("sum_display");
	let value = 0;
	//get all difference cells and sum up total, populating summed_data element
	let difference_tds = document.querySelectorAll(".difference_td");
	for (let i = 0; i < difference_tds.length; i++) {
		if (difference_tds[i].innerText) {
			value += parseInt(difference_tds[i].innerText);
		}
	}
	summed_data.innerText = value;
}

async function storeMemberInputs() {
	//remove old data
	if (localStorage.getItem("member_prices") != null) {
		localStorage.removeItem("member_prices");
	}
	const member_input_arr = [];
	//push all member inputs to local storage
	inputs = document.querySelectorAll(".member_input");
	inputs.forEach((element) => {
		let input_id = element.id;
		let member_value = parseInt(element.value);
		member_input_arr.push({ [input_id]: +member_value });
	});
	localStorage.setItem("member_prices", JSON.stringify(member_input_arr));
}

async function storeAnnualizedSum() {
	//store four piece kitchen annual sum total
	annualized = document.getElementById("annualized").innerText;
	localStorage.setItem("four_piece_kitchen_annualized_sum", annualized);
}

async function storeTableDeliveryInstall() {
	let td_arr = [];
	let td_sub_arr = {};
	let input_arr = [];
	//need predefined data keys to rename object keys later
	let data_keys = [
		"Service",
		"Best Buy Price",
		"Home Depot Price",
		"Lowes Price",
		"Your Price",
		"Difference",
	];

	//this stores all table data except headers as formatted JSON
	//get all table data that is not a header
	$(document).ready(function () {
		$(this)
			.find("td")
			.not(".header")
			//push 6 elements to sub array object (as we have 6 columns), then push sub array to td_arr (array of json objects)
			.each(function (index, element) {
				//create key:value pair (keys are just sequential numbers at this point)
				td_sub_arr[index] = element.innerText;
				if (Object.keys(td_sub_arr).length == 6) {
					td_arr.push(td_sub_arr);
					td_sub_arr = {};
				}
			});

		//get all input values, since above code only finds td elements (14 rows)
		for (let i = 0; i <= 14; i++) {
			//if at last row, get placeholder value
			if (i == 14) {
				var place_hldr_data = $("#four_piece_delivery").attr("placeholder");
				input_arr.push(place_hldr_data);
				break;
			}
			var input_data = $(document).find("input").eq(i).val();
			input_arr.push(input_data);
		}

		//for each td_arr object we are missing the member input field as the first .find("td") does not grab input values
		//populate missing values
		//for each el of input array (looks like this: [1, 2, 3...])
		for (let i = 0; i < input_arr.length; i++) {
			//for each td array element (which are json objects with one val missing: [ {0:"x", 1:"y", 2: ""}, ....])
			for (let j = 0; j < td_arr.length; j++) {
				//for each element in object
				for ([key, val] of Object.entries(td_arr[j])) {
					if (val == "") {
						//found key with missing value, set value to same index as td_arr json object (the order maps perfectly as there are 14 inputs and 14 objects)
						td_arr[j][key] = input_arr[j];
					}
				}
			}
		}

		function rename(obj, oldName, newName) {
			if (!obj.hasOwnProperty(oldName)) {
				return false;
			}

			obj[newName] = obj[oldName];
			delete obj[oldName];
			return true;
		}

		//since all keys are just sequential numbers at this point, we need to rename them to the correct service
		for (sub_arr of td_arr) {
			Object.keys(sub_arr).forEach(function (el, index, arr) {
				rename(sub_arr, el, data_keys[index]);
			});
		}

		localStorage.setItem(
			"delivery_install_download_data",
			JSON.stringify(td_arr)
		);
	});
}

async function storeTableFourPieceKitchen() {
	let td_arr = [];
	let td_sub_arr = {};
	let data_keys = [
		"Service",
		"Best Buy Price",
		"Home Depot Price",
		"Lowes Price",
		"Your Price",
		"Difference",
	];

	$(document).ready(function () {
		$(this)
			.find("table#four_piece_kitchen_table td")
			.not(".header")
			.each(function (index, element) {
				td_sub_arr[index] = element.innerText;
				if (Object.keys(td_sub_arr).length == 5) {
					td_arr.push(td_sub_arr);
					td_sub_arr = {};
				}
			});

		function rename(obj, oldName, newName) {
			if (!obj.hasOwnProperty(oldName)) {
				return false;
			}

			obj[newName] = obj[oldName];
			delete obj[oldName];
			return true;
		}

		for (sub_arr of td_arr) {
			Object.keys(sub_arr).forEach(function (el, index, arr) {
				rename(sub_arr, el, data_keys[index]);
			});
		}

		//need to get data from delta table
		let delta_text = document.getElementById("delta_cell").innerText;
		let weekly_deliveries = document.getElementById("weekly_deliveries").value;
		let annualized = document.getElementById("annualized").innerText;

		let delta_obj = [
			{
				"Delta from competition average": delta_text,
				"Kitchens delivered weekly": weekly_deliveries,
				"Annual Opportunity": annualized,
			},
		];

		four_piece_download_data = td_arr.concat(delta_obj);

		localStorage.setItem(
			"four_piece_kitchen_download_data",
			JSON.stringify(four_piece_download_data)
		);
	});
}

function storeTableLaundry() {
	let td_arr = [];
	let td_sub_arr = {};
	let data_keys = [
		"Service",
		"Best Buy Price",
		"Home Depot Price",
		"Lowes Price",
		"Your Price",
		"Difference",
	];

	$(document).ready(function () {
		$(this)
			.find("table#laundry_table td")
			.not(".header")
			.each(function (index, element) {
				td_sub_arr[index] = element.innerText;
				if (Object.keys(td_sub_arr).length == 5) {
					td_arr.push(td_sub_arr);
					td_sub_arr = {};
				}
			});

		function rename(obj, oldName, newName) {
			if (!obj.hasOwnProperty(oldName)) {
				return false;
			}

			obj[newName] = obj[oldName];
			delete obj[oldName];
			return true;
		}

		for (sub_arr of td_arr) {
			Object.keys(sub_arr).forEach(function (el, index, arr) {
				rename(sub_arr, el, data_keys[index]);
			});
		}

		let delta_text = document.getElementById("delta_cell").innerText;
		let weekly_deliveries = document.getElementById("weekly_deliveries").value;
		let annualized = document.getElementById("annualized").innerText;
		let total_opportunity = document.getElementById("total_sum").innerText;

		let delta_obj = [
			{
				"Delta from competition average": delta_text,
				"Laundry pairs delivered weekly": weekly_deliveries,
				"Annual Opportunity": annualized,
				"Total Annual Opportunity (Kitchen + Laundry)": total_opportunity,
			},
		];

		laundry_download_data = td_arr.concat(delta_obj);

		localStorage.setItem(
			"laundry_download_data",
			JSON.stringify(laundry_download_data)
		);
	});
}

function downloadStoredTables() {
	let delivery_install_data = JSON.parse(
		localStorage.getItem("delivery_install_download_data")
	);
	let four_piece_kitchen_data = JSON.parse(
		localStorage.getItem("four_piece_kitchen_download_data")
	);
	let laundry_data = JSON.parse(localStorage.getItem("laundry_download_data"));

	let delivery_install_csv = jsonToCsv(delivery_install_data);
	let four_piece_kitchen_csv = jsonToCsvWithDelta(four_piece_kitchen_data);
	let laundry_csv = jsonToCsvWithDelta(laundry_data);

	download(delivery_install_csv, "delivery_install");
	download(four_piece_kitchen_csv, "four_piece_kitchen");
	download(laundry_csv, "laundry");

	let total_opportunity = document.getElementById("total_sum").innerText;
	let user_email = document.getElementById("user_email").value;

	dataLayer.push({
		event: "download",
		user_email: user_email,
		total_opportunity: total_opportunity,
	});
}

//https://www.geeksforgeeks.org/how-to-convert-json-object-to-csv-in-javascript/
function jsonToCsv(jsonData) {
	let csv = "";

	// Extract headers
	let headers = Object.keys(jsonData[0]);
	csv += headers.join(",") + "\n";

	// Extract values
	jsonData.forEach((obj) => {
		let values = headers.map((header) => obj[header]);
		csv += values.join(",") + "\n";
	});

	return csv;
}

//for when there are two sets of headers (extra delta table)
function jsonToCsvWithDelta(jsonData) {
	let csv = "";

	// Extract headers
	let headers = Object.keys(jsonData[0]);
	let delta_headers = Object.keys(jsonData[jsonData.length - 1]);
	csv += headers.join(",") + "\n";

	// Extract values
	jsonData.forEach((obj, index) => {
		if (index == Object.keys(jsonData).length - 1) {
			csv += delta_headers.join(",") + "\n";
			let values = delta_headers.map((header) => obj[header]);
			csv += values.join(",") + "\n";
		}
		let values = headers.map((header) => obj[header]);
		csv += values.join(",") + "\n";
	});

	return csv;
}

//https://www.geeksforgeeks.org/how-to-create-and-download-csv-file-in-javascript/
const download = (data, name) => {
	// Create a Blob with the CSV data and type
	const blob = new Blob([data], { type: "text/csv" });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create an anchor tag for downloading
	const a = document.createElement("a");

	// Set the URL and download attribute of the anchor tag
	a.href = url;
	a.download = name + ".csv";

	// Trigger the download by clicking the anchor tag
	a.click();
};

function fourPieceKitchenValues(table_display_data, member_prices) {
	//add member prices to display data
	table_display_data[0].member_price = "$" + member_prices[0].delivery_charges;
	table_display_data[1].member_price = "$" + member_prices[1].haul_away * 4;
	table_display_data[2].member_price = "$" + member_prices[13].h2o_hook_up;
	table_display_data[3].member_price = "$" + member_prices[11].range_cord;
	table_display_data[4].member_price = "$" + member_prices[2].otr_install;
	table_display_data[5].member_price =
		"$" +
		//predefined formula
		parseInt(member_prices[3].dw_install);
	//	parseInt(member_prices[12].dw_kit));

	let sum = 0;
	for (let i = 0; i <= 5; i++) {
		sum += cleanPrice(table_display_data[i].member_price);
	}

	table_display_data[6].sum = "$" + sum;
	table_display_data[7].text = "How has your pricing changed?";
	return table_display_data;
}

function laundryValues(table_display_data, member_prices) {
	table_display_data[0].member_price = "$" + member_prices[0].delivery_charges;
	//"$" + member_prices[0].delivery_charges * 2;
	table_display_data[1].member_price = "$" + member_prices[1].haul_away * 2;

	table_display_data[2].member_price = "$" + member_prices[8].ss_fill_hose_set;
	//table_display_data[2].member_price = "$" + member_prices[7].rubber_fill_hose;
	table_display_data[3].member_price =
		"$" +
		(parseInt(member_prices[9].vent_kit) +
			parseInt(member_prices[10].dryer_cord));

	let sum = 0;
	for (let i = 0; i <= 3; i++) {
		sum += cleanPrice(table_display_data[i].member_price);
	}

	table_display_data[4].sum = sum;
	table_display_data[5].text = "How has your pricing changed?";
	return table_display_data;
}

function sendEmail() {
	//using email.js
	let delivery_install_data = JSON.parse(
		localStorage.getItem("delivery_install_download_data")
	);
	let four_piece_kitchen_data = JSON.parse(
		localStorage.getItem("four_piece_kitchen_download_data")
	);
	let laundry_data = JSON.parse(localStorage.getItem("laundry_download_data"));

	let delivery_install_csv = jsonToCsv(delivery_install_data);
	let four_piece_kitchen_csv = jsonToCsvWithDelta(four_piece_kitchen_data);
	let laundry_csv = jsonToCsvWithDelta(laundry_data);

	const delivery_install_blob = new Blob([delivery_install_csv], {
		type: "text/csv",
	});
	const delivery_install_url = URL.createObjectURL(delivery_install_blob);

	const four_piece_kitchen_blob = new Blob([four_piece_kitchen_csv], {
		type: "text/csv",
	});
	const four_piece_kitchen_url = URL.createObjectURL(four_piece_kitchen_blob);

	const laundry_blob = new Blob([laundry_csv], { type: "text/csv" });
	const laundry_url = URL.createObjectURL(laundry_blob);

	let user_email = document.getElementById("user_email").value;
	let total_opportunity = document.getElementById("total_sum").innerText;

	let templateParams = {
		email: user_email,
		delivery_install: delivery_install_url,
		four_piece_kitchen: four_piece_kitchen_url,
		laundry: laundry_url,
		total_opportunity: total_opportunity,
	};

	let templateParamsLead = {
		to_email: "marketing@avb.net",
		email: user_email,
		delivery_install: delivery_install_url,
		four_piece_kitchen: four_piece_kitchen_url,
		laundry: laundry_url,
		result: total_opportunity,
	};

	//user email
	emailjs.send("service_6c8n4sr", "template_f2n852j", templateParams).then(
		(response) => {
			alert("Check Your Inbox For Links To Your Files");
			console.log("SUCCESS!", response.status, response.text);
		},
		(error) => {
			console.log("FAILED...", error);
		}
	);	
	
	//lead email
	emailjs.send("service_6c8n4sr", "template_dljxoxl", templateParamsLead).then(
		(response) => {
			console.log("SUCCESS!", response.status, response.text);
		},
		(error) => {
			console.log("FAILED...", error);
		}
	);

	dataLayer.push({
		event: "email_submitted",
		user_email: user_email,
		total_opportunity: total_opportunity,
	});
}

function sendEmailLead() {
	let delivery_install_data = JSON.parse(
		localStorage.getItem("delivery_install_download_data")
	);
	let four_piece_kitchen_data = JSON.parse(
		localStorage.getItem("four_piece_kitchen_download_data")
	);
	let laundry_data = JSON.parse(localStorage.getItem("laundry_download_data"));

	let delivery_install_csv = jsonToCsv(delivery_install_data);
	let four_piece_kitchen_csv = jsonToCsvWithDelta(four_piece_kitchen_data);
	let laundry_csv = jsonToCsvWithDelta(laundry_data);

	const delivery_install_blob = new Blob([delivery_install_csv], {
		type: "text/csv",
	});
	const delivery_install_url = URL.createObjectURL(delivery_install_blob);

	const four_piece_kitchen_blob = new Blob([four_piece_kitchen_csv], {
		type: "text/csv",
	});
	const four_piece_kitchen_url = URL.createObjectURL(four_piece_kitchen_blob);

	const laundry_blob = new Blob([laundry_csv], { type: "text/csv" });
	const laundry_url = URL.createObjectURL(laundry_blob);

	let total_opportunity_email = document.getElementById("total_sum").innerText;
	let user_email = document.getElementById("user_email").value;
	
	var templateParams = {
		to_email: "marketing@avb.net",
		email: user_email,
		delivery_install: delivery_install_url,
		four_piece_kitchen: four_piece_kitchen_url,
		laundry: laundry_url,
		result: total_opportunity_email,
	};

	emailjs.send("service_6c8n4sr", "template_dljxoxl", templateParams).then(
		(response) => {
			console.log("SUCCESS!", response.status, response.text);
		},
		(error) => {
			console.log("FAILED...", error);
		}
	);
}
