class Fuzzyness{

    constructor(pField, pValue, pCount = 2) {
        this.field = pField;
        this.count = pCount;
        this.prettyPrint = false;

        if(pValue.length === 0 || pValue.length<=pCount){
            return;
        }

        this.values = [pValue, pValue+'%', '%'+pValue, '%'+pValue+'%'];

        for(let i = 1, max = this.count+1; i<max; i++){
            this._fuzz(i);
        }
    }

    _fuzz(pCount){
        let ref  = this;
        this.values.forEach(function(pVal){
            if((pVal.match(/_/g)||[]).length>=ref.count){
                return;
            }
            let val = pVal.split('');
            for(let i = val.length; i>0; i--){
                let newVal = [].concat(val);
                newVal.splice(i-pCount, pCount, '_');
                let fuzz = newVal.join('');
                fuzz = fuzz.replace(/([_]+)/g, '_');
                if(ref.values.indexOf(fuzz)>-1 || fuzz === '_'){
                    continue;
                }
                ref.values.push(fuzz);
            }
        });
    }

    get(){
        if(this.values.length===0){
            return '';
        }
        let sep = this.prettyPrint?"\r\n":"";
        let sep_entry = this.prettyPrint?"\r\n\t":"";
        let ref = this;
        let or = this.values.reduce(function(pReturn, pVal){
            let like = ref.field+' LIKE "'+pVal+'"';
            if(pReturn !== '('){
                like = ' OR '+like;
            }
            return pReturn+sep_entry+like;
        }, '(')+')';
        let index = 0;
        let order = this.values.reduce(function(pReturn, pVal){
            return pReturn+sep_entry+'WHEN '+ref.field+' LIKE "'+pVal+'" THEN '+(index++)+' ';
        }, 'CASE ')+sep+'END ASC';
        return "WHERE "+or+sep+" ORDER BY "+order+";";
    }

}