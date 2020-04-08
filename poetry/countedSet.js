/**
 * This class defines a Counted Set. A Counted Set is like a blend between a dictionary and a Hashset.
 * Unlike a normal set, which cannot have duplicates, a counted set tracks how many times an identical object
 * has been added to it. This implementation wraps a standard JavaScript Object.
 */
 class countedSet{
    constructor(){
      this.data = {};
    }
    
    /**
     * Get the count of an entry in the set
     * @param {*} obj entry to test
     * @return {number} the count of for `obj`, or undefined if it is not present
     */
    count(obj){
      if (this.data.hasOwnProperty(obj)){
        return this.data[obj];
      }
      else{
       return undefined; 
      }
    }
    
    /**
     * Changes the count for an entry by a specific amount. If no record exists, one is created
     * @param {*} obj entry to change
     * @param {number} value new value for the entry. If the resulting value is 0 or less, the entry will be deleted if it exists.
     * @returns {number} the new count for `obj`
     */
    changeCount(obj,value){
        if (this.data.hasOwnProperty(obj)){ 
          this.set(obj,this.data[obj]+value);
        }
        else{
           this.set(obj,value);
        }
        return this.data[obj];
    }
    
    /**
     * Sets the count for an entry. If no record exists, one is created.
     * @param {*} obj entry to change
     * @param {number} value new count for the entry. If this value is 0 or less, the entry will be deleted if it exists
     * @returns the new count for `obj`
     */ 
    set(obj,value){
      this.data[obj] = value;
      // can't have 0 or less of an object
      if (this.data[obj] <= 0){
         delete this.data[obj]; 
      }
     return this.data[obj];
    }
    
    /**
     * Adds an item to the countedSet, or increments its counter if it is already present. This is the way you should add things to the set.
     * @param {*} obj data to add
     * @returns {number} the new count for `obj`
     */
    add(obj){
       return this.changeCount(obj,1);
    }
   
    /**
     * Removes an item from the countedSet, decrementing its count by 1.
     * @param {*} obj data to remove
     * @returns {number} the new count for `obj`
     */
    remove(obj){
      if (this.data.hasOwnProperty(obj)){
        return this.changeCount(obj,-1);
      }
    }
   
    /**
     * Deletes an item from the set entirely. 
     * @param {*} obj entry to delete
     */
    del(obj){
      delete this.data[obj];
    }
    
    /**
     * @returns {string} standard JSON representation of the data inside the set
     */
    toString(){
     return JSON.stringify(this.data); 
    }

    /**
     * @returns {number} The sum of all the items inside the set
     */
    total(){
        let amt = 0;
        let keys = Object.keys(this.data);
        for (let key of keys){
            amt += this.count(key);
        }
        return amt;
    }
  }
