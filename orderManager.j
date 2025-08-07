let orders = [];

function addOrder(user, productCode) {
  const order = { user, productCode, status: "pending" };
  orders.push(order);
  return order;
}

function confirmOrder(user) {
  const order = orders.find(o => o.user === user && o.status === "pending");
  if (order) {
    order.status = "confirmed";
    return order;
  }
  return null;
}

function markReady(user) {
  const order = orders.find(o => o.user === user && o.status === "confirmed");
  if (order) {
    order.status = "ready";
    return order;
  }
  return null;
}

module.exports = { addOrder, confirmOrder, markReady };
