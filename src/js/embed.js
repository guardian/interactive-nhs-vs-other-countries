import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'
import indicators from '../assets/data/indicators.json!json'
import { loadData } from './lib/loadData';
import SmallMultiples from './components/SmallMultiples';

window.init=function(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    let queries=window.location.search.replace("?","").split("&"),
        selected_indicators=[],
        selected_country="UK";

    queries.forEach(q => {
      let query=q.split("=");

      if(query[0]==="i") {
          selected_indicators=query[1].split(",").map(d => +d);
      }
      if(query[0]==="c") {
          selected_country=query[1]
      }  

    })

    

    //console.log(selected_indicators,selected_country)


    loadData((data)=>{
        //console.log(data)



        new SmallMultiples(data,{
            container:"#NHSComparison",
            country:selected_country,
            indicators:indicators,
            //selected_indicators:d3.keys(indicators).filter((d,i)=> selected_indicators.indexOf(i)>-1)
            selected_indicators:(function(){
                          let __indicators=[];
                          selected_indicators.forEach((d)=>{
                            __indicators.push(d3.keys(indicators)[d])
                          });
                          return __indicators
                        }())
        })

        iframeMessenger.enableAutoResize();
    });

    
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};
