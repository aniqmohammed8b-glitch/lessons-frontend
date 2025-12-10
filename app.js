const app = new Vue({
  el: '#app',
  data: {
    lessons: [],
    cart: [],
    name: '',
    phone: '',
    errorMsg: '',
    successMsg: ''
  },
  created() {
    this.fetchLessons();
  },
  methods: {
    async fetchLessons() {
      try {
        const res = await fetch('/lessons');
        this.lessons = await res.json();
      } catch (err) {
        console.error(err);
      }
    },
    addToCart(lesson) {
      if (lesson.spaces > 0) {
        this.cart.push(lesson);
        lesson.spaces--;
      }
    },
    removeFromCart(index) {
      const lesson = this.cart[index];
      this.lessons.find(l => l._id === lesson._id).spaces++;
      this.cart.splice(index, 1);
    },
    canCheckout() {
      return /^[a-zA-Z\s]+$/.test(this.name) && /^[0-9]+$/.test(this.phone);
    },
    async submitOrder() {
      if (!this.canCheckout()) {
        this.errorMsg = "Please enter valid name and phone number.";
        this.successMsg = '';
        return;
      }

      try {
        const response = await fetch('/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.name,
            phone: this.phone,
            cart: this.cart
          })
        });

        const result = await response.json();

        if (response.ok) {
          this.successMsg = "✅ Order submitted successfully!";
          this.errorMsg = '';
          this.cart = [];
          this.name = '';
          this.phone = '';
          this.fetchLessons();
        } else {
          this.errorMsg = result.error || "Order failed.";
          this.successMsg = '';
        }
      } catch (err) {
        console.error(err);
        this.errorMsg = "Server error. Please try again.";
        this.successMsg = '';
      }
    }
  }
});
