var helper = {

    toUTC: function(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },
  
    now: function() {
        return new Date();
    },

    nowUTC: function() {
        return this.toUTC(this.now());
    }

}

module.exports = helper;