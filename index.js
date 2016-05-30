var datree = require('datree');

module.exports = {
    _datreeUpdateTobj: null,
    _datreeScheduledUpdates: {},
    _datreeScheduleUpdate: function(isFields, key){
        if(!this._datreeNode) return;
        this._datreeScheduledUpdates[key] = this._datreeNode[key];
        var self = this;
        if(!self._datreeUpdateTobj) {
            self._datreeUpdateTobj = setTimeout(function(){
                self._datreeUpdateTobj = null;
                self.setState(self._datreeScheduledUpdates);
            }, 0);
        }
    },
    getInitialState: function(){
        var self = this;
        self._datreeNode = datree.Node.create({
            source: self.datreeSource || undefined,
            fields: self.datreeStates,
            update: function(){
                self._datreeScheduleUpdate(false, this.path[0]);
            },
            updateFields: function(){
                self._datreeScheduleUpdate(true, this.path[0]);
            },
        });
        return self._datreeNode;
    },
    componentWillUnmount: function(){
        this._datreeNode.destroy();
    },
};
