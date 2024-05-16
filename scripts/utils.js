function log(...args) {
    if (this.debug){
        console.log(...args);
    }    
}