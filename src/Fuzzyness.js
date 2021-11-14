class Fuzzyness{

    constructor(pField, pValue, pCount = 2) {
        this.field = pField;
        this.count = pCount;

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
            if((pVal.match(/%/g)||[]).length>=ref.count){
                return;
            }
            let val = pVal.split('');
            for(let i = val.length; i>0; i--){
                let newVal = [].concat(val);
                newVal.splice(i-pCount, pCount, '%');
                let fuzz = newVal.join('');
                fuzz = fuzz.replace(/([%]+)/g, '%');
                if(ref.values.indexOf(fuzz)>-1 || fuzz === '%'){
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
        let ref = this;
        let or = this.values.reduce(function(pReturn, pVal){
            let like = ref.field+' LIKE "'+pVal+'"';
            if(pReturn !== '('){
                like = ' OR '+like;
            }
            return pReturn+like;
        }, '(')+')';
        let index = 0;
        let order = this.values.reduce(function(pReturn, pVal){
            return pReturn+'WHEN '+ref.field+' LIKE "'+pVal+'" THEN '+(index++)+' ';
        }, 'CASE ')+'END ASC';
        return "WHERE "+or+" ORDER BY "+order+";";
    }

}