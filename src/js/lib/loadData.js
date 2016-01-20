import d3 from 'd3';

export function loadData(callback) {

    let data=[];
    
    let dataKey = "1N-27oo4e026NGFOqiSrGpmmanxorN3tbpc0bcsnuNcU";

    let dataSrc = "https://interactive.guim.co.uk/docsdata-test/" + dataKey + ".json";

    d3.json(dataSrc, (json) => {
    
        //console.log(json)

        if(callback) {
            callback(updateData(json))
            
        }

    });

}

function updateData(json) {

    let data=[];

    let countries=[ "Australia",
                    "China",
                    "France",
                    //"Germany",
                    "Ireland",
                    //"Israel",
                    "Italy",
                    //"Japan",
                    "Russia",
                    //"Spain",
                    "Sweden",
                    "United Kingdom",
                    "United States" ];

    let shortNames={
        "United Kingdom":"UK",
        "United States":"US"
    }

    let filter=["Current expenditure, % GDP","Doctors per 1,000 pop.","C-sections","Antibiotics","Nurses per 1,000 pop","Hospital discharges","ALOS, all causes","Current exp, per capita, AAGR"]
    //filter=["Current expenditure, % GDP"]
    //filter=["Current exp, per capita, AAGR"]
    for(let sheet in json.sheets) {
        //console.log(json.sheets[sheet])
        if(filter.indexOf(sheet)>-1) {

            data.push({
                title:sheet,
                data:d3.values(json.sheets[sheet]).filter(d=>countries.indexOf(d.Country)>-1).map((d)=>{
                    //console.log(d)
                    d.Country=d.Country.trim();
                    return {
                        country:shortNames[d.Country] || d.Country,
                        data:d3.entries(d).filter((v)=>{
                            return v.key.indexOf("(")===-1 && !isNaN(+v.key.split("-")[0])
                        }).map((v)=>({
                            year:+v.key.split("-")[0],
                            value:isNaN(+v.value)?null:+v.value
                        })).filter(v => v.year>0).sort((a,b)=>(a.year-b.year))
                    }
                })
            })    
        }
        

    }

    return data;
}