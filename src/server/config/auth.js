module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }   
        req.flash('error', 'Please Login in to view the map');
        res.redirect('/users/login');
    }
}