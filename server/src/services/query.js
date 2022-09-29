const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0; // Mongoose considers `0` as `no limit` ~ no paging at all, fetch all

// * Every module is likely to require pagination.
// * Thus, it's a good idea to make it a reusable service.
function getPaginationParams({ limit, page }) {
  // * Conceptually, underscores `_` make variable private accessible
  // *  just to scope in which they are declared.
  const _page = Math.abs(page) || DEFAULT_PAGE_NUMBER;
  const _limit = Math.abs(limit) || DEFAULT_PAGE_LIMIT;

  const skip = (_page - 1) * _limit;

  return {
    skip,
    limit: _limit,
  };
}

module.exports = {
  getPaginationParams,
};
