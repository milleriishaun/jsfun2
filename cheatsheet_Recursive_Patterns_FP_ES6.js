// It allows me to write terse, declarative code that is easy
// to test and reason about.

// Functional programming (often abbreviated FP) is the process
// of building software by composing pure functions, avoiding shared
// state, mutable data,and side-effects. Functional programming is
// declarative rather than imperative, and application state flows
// through pure functions. Contrast with object oriented programming,
// where application state is usually shared and colocated with
// methods in objects.

// ES6 brings many features that allow us to easily write pure
// functions, rest/spread being one of the most powerful. Using
// rest params, we’re able to “loop without loops” with recursion.
// In this article, we’re going to rewrite many commonly used
// JavaScript methods/functions that allow for functional patterns.

// Many functions below are tail-recursive and should be optimized
// further. ES6 brings tail-call optimization, but must be used in
// conjunction with 'use strict'.

// Head
// Return the first item in an array. Is useful when you need to
// separate the first item from the rest of the array items. To
// do this, we make use of destructuring assignment.
const head = ([x]) => x;
//
const array = [1, 2, 3, 4, 5];
head(array); // 1

// Tail
// Return all but the first item in an array.
const tail = ([, ...xs]) => xs;
// equivalent to the following:
const tail = ([x, ...xs]) => xs;
// Since we don’t need to use x in the returned output, we can
// drop it, but keep the comma to get the rest of the items in
// the array.
//
const array = [1, 2, 3, 4, 5];
tail(array); // [2,3,4,5]

// Def
// Return if argument supplied is defined.
const def = x => typeof x !== 'undefined';
//
const defined = 'this is defined';
def(defined); // true
def(doesntExist); // false

// Undef
// Return if argument supplied is undefined.
const undef = x => !def(x);
//
const defined = 'this is defined';
undef(defined); // false
undef(doesntExist); // true

// Copy
// Returns a copy of an array without using Array.slice().
// Makes use of spread.
const copy = array => [...array];
//
let array = [1, 2, 3, 4, 5];
let copied = copy(array);
copied.push(6);
array; // [1,2,3,4,5]
copied; // [1,2,3,4,5,6]

// Length
// Return the length of an array. This is a very simple form of
// looping through an array with recursion, even though the values
// of the array don’t matter in this case (increments up starting
// at 1 for every item in array). We include the len param to avoid
// tail recursion.
const length = ([x, ...xs], len = 0) => (def(x) ? length(xs, len + 1) : len);
// If we don’t care about tail recursion, we can write it as:
const length = ([x, ...xs]) => (def(x) ? 1 + length(xs) : 0);
// This would add a stack frame for each item in the array,
// whereas the version that avoids tail recursion, replaces a
// single stack frame. If the array passed in is large enough, it
// will throw “Maximum call stack size exceeded”.
//
const array = [1, 2, 3, 4, 5];
length(array); // 5

// Reverse
// Return a reversed array.
const reverse = ([x, ...xs]) => (def(x) ? [...reverse(xs), x] : []);
//
const array = [1, 2, 3, 4, 5];
reverse(array); // [5,4,3,2,1]
// Array.reverse() is okay, but it modifies the value in place
// which is a side-effect. Consider the following:
//
const array = [1, 2, 3, 4, 5];
const newArray = array.reverse(); // [5,4,3,2,1]
array; // [5,4,3,2,1]
// using the reverse method we just created
const array2 = [1, 2, 3, 4, 5];
const newArray2 = reverse(array2); // [5,4,3,2,1]
array2; // [1,2,3,4,5]

// First
// Returns a new array that contains the first n items of the
// given array.
const first = ([x, ...xs], n = 1) =>
  def(x) && n ? [x, ...first(xs, n - 1)] : [];
//
const array = [1, 2, 3, 4, 5];
first(array, 3); // [1,2,3]

// Last
// Returns a new array that contains the last n items of the given
// array.
const last = (xs, n = 1) => reverse(first(reverse(xs), n));
//
const array = [1, 2, 3, 4, 5];
last(array, 3); // [3,4,5]

// Slice
// Returns a new array with value inserted at given index.
const slice = ([x, ...xs], i, y, curr = 0) =>
  def(x)
    ? curr === i
      ? [y, x, ...slice(xs, i, y, curr + 1)]
      : [x, ...slice(xs, i, y, curr + 1)]
    : [];
//
const array = [1, 2, 4, 5];
slice(array, 2, 3); // [1,2,3,4,5]

// isArray
// Returns if the value supplied is an array. Allows us to write
// Array.isArray() in a more functional manner.
const isArray = x => Array.isArray(x);
//
const array = [1, 2, 3, 4, 5];
isArray(array); // true

// Flatten
// Combines nested arrays into a single array.
const flatten = ([x, ...xs]) =>
  def(x)
    ? isArray(x)
      ? [...flatten(x), ...flatten(xs)]
      : [x, ...flatten(xs)]
    : [];
//
const array1 = [1, 2, 3];
const array2 = [4, [5, [6]]];
flatten([array1, array2]); // [1,2,3,4,5,6]

// Swap
// Return a new array with 2 items swapped based on their index.
const swap = (a, i, j) =>
  map(a, (x, y) => {
    if (y === i) return a[j];
    if (y === j) return a[i];
    return x;
  });
//
const array = [1, 2, 3, 4, 5];
swap(array, 0, 4); // [5,2,3,4,1]

// Map
// From MDN: “…creates a new array with the results of calling a
// provided function on every element in this array.”
const map = ([x, ...xs], fn) => {
  if (undef(x)) return [];
  return [fn(x), ...map(xs, fn)];
};
// Which can be simplified as:
const map = ([x, ...xs], fn) => (def(x) ? [fn(x), ...map(xs, fn)] : []);
//
const double = x => x * 2;
map([1, 2, 3], double); // [2,4,6]

// Filter
// From MDN: “…creates a new array with all elements that pass the
// test implemented by the provided function.”
const filter = ([x, ...xs], fn) => {
  if (undef(x)) return [];
  if (fn(x)) {
    return [x, ...filter(xs, fn)];
  } else {
    return [...filter(xs, fn)];
  }
};
// Which can be simplified as:
const filter = ([x, ...xs], fn) =>
  def(x) ? (fn(x) ? [x, ...filter(xs, fn)] : [...filter(xs, fn)]) : [];
//
const even = x => x % 2 === 0;
const odd = (x = !even(x));
const array = [1, 2, 3, 4, 5];
filter(array, even); // [2,4]
filter(array, odd); // [1,3,5]

// Reject
// The opposite of filter, returns an array that does not pass
// the filter function.
const reject = ([x, ...xs], fn) => {
  if (undef(x)) return [];
  if (!fn(x)) {
    return [x, ...reject(xs, fn)];
  } else {
    return [...reject(xs, fn)];
  }
};
//
const even = x => x % 2 === 0;
const array = [1, 2, 3, 4, 5];

reject(array, even); // [1,3,5]

// Partition
// Splits an array into two arrays. One whose items pass a filter
// function and one whose items fail.
const partition = (xs, fn) => [filter(xs, fn), reject(xs, fn)];
//
const even = x => x % 2 === 0;
const array = [0, 1, 2, 3, 4, 5];
partition(array, even); // [[0,2,4], [1,3,5]]

// Reduce
// From MDN: “…applies a function against an accumulator and
// each element in the array (from left to right) to reduce it
// to a single value.”

const reduce = ([x, ...xs], fn, memo, i) => {
  if (undef(x)) return memo;
  return reduce(xs, fn, fn(memo, x, i), i + 1);
};

// Which can be simplified as:
const reduce = ([x, ...xs], fn, memo, i = 0) =>
  def(x) ? reduce(xs, fn, fn(memo, x, i), i + 1) : memo;
//
const sum = (memo, x) => memo + x;
reduce([1, 2, 3], sum, 0); // 6
const flatten = (memo, x) => memo.concat(x);
reduce([4, 5, 6], flatten, [1, 2, 3]); // [1,2,3,4,5,6]

// ReduceRight
// Similar to reduce, but applies the function from
// right-to-left.
const reduceRight = (xs, fn, memo) => reduce(reverse(xs), fn, memo);
//
const flatten = (memo, x) => memo.concat(x);
reduceRight([[0, 1], [2, 3], [4, 5]], flatten, []); // [4, 5, 2, 3, 0, 1]

// Partial
// Partially apply a function by filling in any number of its
// arguments.
const partial = (fn, ...args) => (...newArgs) => fn(...args, ...newArgs);
//
const add = (x, y) => x + y;
const add5to = partial(add, 5);
add5to(10); // 15

// SpreadArg
// Convert function that takes an array to one that takes
// multiple arguments. This is useful when partially applying.

const spreadArg = fn => (...args) => fn(args);
//
const add = ([x, ...xs]) => (def(x) ? parseInt(x + add(xs)) : []);
add([1, 2, 3, 4, 5]); // 15
const spreadAdd = spreadArg(add);
spreadAdd(1, 2, 3, 4, 5); // 15
// If you only want to define a single function you can
// write it as:
const add = spreadArg(([x, ...xs]) => (def(x) ? parseInt(x + add(...xs)) : []));
add(1, 2, 3, 4, 5); // 15
// In the above, you need to remember to spread the array you
// are sending into the function recursively, since you are
// spreading the argument.

// ReverseArgs
// Reverse function argument order.
const reverseArgs = fn => (...args) => fn(...reverse(args));
//
const divide = (x, y) => x / y;
divide(100, 10); // 10
const reverseDivide = reverseArgs(divide);
reverseDivide(100, 10); // 0.1
// Reversing arguments can be useful when partially applying
// arguments. Sometimes you want to partially apply arguments
// at the end of the list, not those at the beginning. Reversing
// the arguments allows us to do that.
const percentToDec = partial(reverseDivide, 100);
percentToDec(25); // 0.25

// Pluck
// Extract property value from array. Useful when combined with
// the map function.
const pluck = (key, object) => object[key];
//
const product = { price: 15 };
pluck('price', product); // 15
const getPrices = partial(pluck, 'price');
const products = [{ price: 10 }, { price: 5 }, { price: 1 }];
map(products, getPrices); // [10,5,1]

// Flow
// Each function consumes the return value of the function that
// came before.
const flow = (...args) => init => reduce(args, (memo, fn) => fn(memo), init);
//
const getPrice = partial(pluck, 'price');
const discount = x => x * 0.9;
const tax = x => x + x * 0.075;
const getFinalPrice = flow(
  getPrice,
  discount,
  tax
);
// looks like: tax(discount(getPrice(x)))
// -> get price
// -> apply discount
// -> apply taxes to discounted price
const products = [{ price: 10 }, { price: 5 }, { price: 1 }];
map(products, getFinalPrice); // [9.675, 4.8375, 0.9675]

// Compose
// The same as flow, but arguments are applied in the reverse
// order. Compose matches up more naturally with how functions
// are written. Using the same data as defined for the flow
// function:
const compose = (...args) => flow(...reverse(args));
//
const getFinalPrice = compose(
  tax,
  discount,
  getPrice
);
// looks like: tax(discount(getPrice(x)))
map(products, getFinalPrice); // [9.675, 4.8375, 0.9675]

// Min
// Return the smallest number in an array. Returns Infinity if
// array supplied is empty.
const min = ([x, ...xs], result = Infinity) =>
  def(x) ? (x < result ? min(xs, x) : result) : result;
//
const array = [0, 1, 2, 3, 4, 5];
min(array); // 0

// Max
// Return the largest number in an array. Returns -Infinity if
// array supplied is empty.
const max = ([x, ...xs], result = -Infinity) =>
  def(x) ? (x > result ? max(xs, x) : max(xs, result)) : result;
//
const array = [0, 1, 2, 3, 4, 5];
max(array); // 5

// Factorial
// Returns the factorial of a number. Uses an accumulator to
// allow replacing of stack frames to allow larger factorials
// to be returned.
const factorial = (x, acum = 1) => (x ? factorial(x - 1, x * acum) : acum);
//
factorial(5); // 120

// Fibonacci
// Returns the Fibonacci number at the given place.
const fib = x => (x > 2 ? fib(x - 1) + fib(x - 2) : 1);
//
fib(15); // 610

// Quicksort
// Sort an array from smallest to largest. This is done by
// re-ordering the array so that it contains two sub-arrays,
// one with smaller values, the other with larger values. The
// above steps are recursively applied to each sub-array until
// there are no arrays left, which is flatten to return a sorted
// array.
const quicksort = xs =>
  length(xs)
    ? flatten([
        quicksort(filter(tail(xs), x => x <= head(xs))),
        head(xs),
        quicksort(filter(tail(xs), x => x > head(xs)))
      ])
    : [];
// This can also be implemented using partition,
// but requires variable assignment.
const quicksort = array => {
  if (!length(array)) return [];
  const [less, more] = partition(tail(array), x => x < head(array));
  return flatten([quicksort(less), head(array), quicksort(more)]);
};
//
const array = [8, 2, 6, 4, 1];
quicksort(array); // [1,2,4,6,8]

// Everything as a Reduction
// Many of the functions above can be converted into reductions,
// which should increase performance in most, if not all cases.
// This also shows the flexibility of the reduce function.
// reduce:
const reduce = ([x, ...xs], f, memo, i = 0) =>
  def(x) ? reduce(xs, f, f(memo, x, i), i + 1) : memo;
// reduce reduce:
const reverse = xs => reduce(xs, (memo, x) => [x, ...memo], []);
// length reduce:
const length = xs => reduce(xs, (memo, x) => memo + 1, 0);
// map reduce:
const map = (xs, fn) => reduce(xs, (memo, x) => [...memo, fn(x)], []);
// filter reduce:
const filter = (xs, fn) =>
  reduce(xs, (memo, x) => (fn(x) ? [...memo, x] : [...memo]), []);
// reject reduce:
const reject = (xs, fn) =>
  reduce(xs, (memo, x) => (fn(x) ? [...memo] : [...memo, x]), []);
// first reduce:
const first = (xs, n) =>
  reduce(xs, (memo, x, i) => (i < n ? [...memo, x] : [...memo]), []);
// last reduce:
const last = (xs, n) =>
  reduce(
    xs,
    (memo, x, i) => (i >= length(xs) - n ? [...memo, x] : [...memo]),
    []
  );
// merge reduce:
const merge = spreadArg(xs => reduce(xs, (memo, x) => [...memo, ...x], []));
// flatten reduce:
const flatten = xs =>
  reduce(
    xs,
    (memo, x) =>
      x ? (isArray(x) ? [...memo, ...flatten(x)] : [...memo, x]) : [],
    []
  );
// add reduce:
const add = spreadArg(([x, ...xs]) => reduce(xs, (memo, y) => memo + y, x));
// divide reduce:
const divide = spreadArg(([x, ...xs]) => reduce(xs, (memo, y) => memo / y, x));
// multiply reduce:
const multiply = spreadArg(([x, ...xs]) =>
  reduce(xs, (memo, y) => memo * y, x)
);

//
// Example usages
//
reverse([1, 2, 3]); // [3,2,1]
length([1, 2, 3]); // 3
map([1, 2, 3], double); // [2,3,4]
filter([1, 2, 3, 4], even); // [2,4]
reject([1, 2, 3, 4], even); // [1,3]
first([1, 2, 3, 4], 3); // [1,2,3]
last([1, 2, 3, 4], 2); // [3,4]
merge([1, 2, 3], [4, 5, 6]); // [1,2,3,4,5,6]
flatten([1, [2, 3, [4, [5, [[6]]]]]]); // [1,2,3,4,5,6]
add(1, 2, 3, 4, 5); // 15
multiply(2, 5, 10); // 100
divide(100, 2, 5); // 10

// I hope this article helps shed insight on some of the
// patterns made available with JavaScript and ES6. Many
// problems that can be solved with iteration/loops, can also
// be solved functionally through recursion. I hope this article
// was also able to show you the flexibility of the reduce
// function.
