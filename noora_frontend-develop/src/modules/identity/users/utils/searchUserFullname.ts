function searchUserFullname(value: string) {
  return {
    $expr: {
      $regexMatch: {
        input: { $concat: ["$name", " ", "$lastname"] },
        regex: value,
        options: "i",
      },
    },
  };
}

export default searchUserFullname;
