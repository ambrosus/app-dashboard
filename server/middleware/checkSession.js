
module.exports = (req, res, next) => {
  try {
    const address = req.body.address || req.params.address || req.query.address;
    const session = req.session;

    if (!session || address !== session.address) {
      throw 'Unauthorized';
    }

    next();
  } catch (error) {
    res.status(401).json({ message: error });
  }
};
