import mainHTML from './text/main.html!text'
import indicators from '../assets/data/indicators.json!json'
import { loadData } from './lib/loadData';
import SmallMultiples from './components/SmallMultiples';

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    loadData((data)=>{
        //console.log(data)
        let selected_indicators=d3.range(d3.keys(indicators).length);
        new SmallMultiples(data,{
            container:"#NHSComparison",
            country:"UK",
            indicators:indicators,
            selected_indicators:d3.keys(indicators).filter((d,i)=> selected_indicators.indexOf(i)>-1)
        })
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
