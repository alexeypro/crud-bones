var helper = {

    toUTC: function(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },
  
    now: function() {
        return new Date();
    },

    nowUTC: function() {
        return this.toUTC(this.now());
    },

    capitalize: function(str) {
    	return str.charAt(0).toUpperCase() + str.slice(1);
    }

}

module.exports = helper;