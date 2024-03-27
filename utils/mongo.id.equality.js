export const checkMongoIdsEquality = (id1, id2) => {
  const isEqual = String(id1) === String(id2);

  return isEqual;
};
