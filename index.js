const jimp = require("jimp")
const fs = require('fs')

if (!process.argv[2]){
	console.log("you need to specify a path to the img, ie; node index.js ./img/name.png")
	return false;
}

const path = process.argv[2];
const outputFileName = "./output.save"

jimp.read(path, (err, img ) => {
	const width = img.bitmap.width;
	const height = img.bitmap.height;

	let compte_couleurs = [];
	let transparent_coordonnees = {
		amount : 0,
		coordonnées_array : [],
		value: -1
	};

	for ( let x = 0; x < width; x++){

		for ( let y = 0; y < height ; y++){

			const couleur_int = img.getPixelColor(x,y);
			const couleur_rgba = jimp.intToRGBA(couleur_int);

			switch(couleur_rgba.a){
				case 0: {
						transparent_coordonnees.amount = transparent_coordonnees.amount + 1;
						transparent_coordonnees.coordonnées_array.push([x,y])
				};break;
				case 255: {
					const stringified_color = JSON.stringify(couleur_rgba)
					
					try{
						compte_couleurs[stringified_color].amount = compte_couleurs[stringified_color].amount + 1;
						compte_couleurs[stringified_color].coordonnées_array.push([x,y]);
					}catch{
						compte_couleurs[stringified_color] = {};
						compte_couleurs[stringified_color].amount = 1;

						compte_couleurs[stringified_color].coordonnées_array = [];
						compte_couleurs[stringified_color].coordonnées_array.push([x,y]);
					}

				};break;
			}

		}
	}

	//array to check duped values
	let value_array = []

	Object.keys(compte_couleurs).forEach(key => {

		let value = 1;
			
			Object.keys(compte_couleurs).forEach(subkey => {
				
				if (compte_couleurs[key].amount < compte_couleurs[subkey].amount){

					value++;

				}

			});

			while(value_array.includes(value)){
				value++
			}
			compte_couleurs[key].value = value;
		value_array.push(value)
	});

	compte_couleurs["transparent"] = transparent_coordonnees
	
	let zebi_array = [];

	for (let i = 0 ; i < width ; i++){
		zebi_array.push([])
	}

	zebi_array.forEach(dimension_un => {
			for (let i = 0 ; i < height ; i++){
				dimension_un.push("");
			}
	});

	Object.keys(compte_couleurs).forEach(key=>{
		compte_couleurs[key].coordonnées_array.forEach(coordonnees=>{
			zebi_array[coordonnees[0]][coordonnees[1]] = compte_couleurs[key].value
		})
	})
	
	fs.writeFile(outputFileName, zebi_array.toString().replaceAll(",",":"),err=>{
		if (err) console.log(err)
		else console.log("content saved in " + outputFileName)
	})
})
