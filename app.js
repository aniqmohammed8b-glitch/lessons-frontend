new Vue({
  el: '#lessonsclasses',
  data: {
    sortAttribute: 'subject',
    sortOrder: 'asc',
    showCart: false,
    name: '',
    phone: '',
    checkoutMessage: '',
    lessons: [],
    cart: []
  },
  computed: {
    sortedLessons() {
      return this.lessons.slice().sort((a, b) => {
        let aVal = a[this.sortAttribute];
        let bVal = b[this.sortAttribute];
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        return this.sortOrder === 'asc'
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1;
      });
    },
    validName() {
      return /^[A-Za-z\s]+$/.test(this.name);
    },
    validPhone() {
      return /^[0-9]+$/.test(this.phone);
    }
  },
  methods: {
    toggleCart() {
      this.showCart = !this.showCart;
    },
    addToCart(lesson) {
      if (lesson.spaces > 0) {
        lesson.spaces--;
        this.cart.push(lesson);
      }
    },
    removeFromCart(index, lesson) {
      lesson.spaces++;
      this.cart.splice(index, 1);
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    checkout() {
      const orderPayload = {
        name: this.name,
        phone: this.phone,
        items: this.cart.map(item => ({
          lessonId: item._id,
          subject: item.subject,
          quantity: 1
        }))
      };

      // Save order
      fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })
      .then(res => res.json())
      .then(data => {
        // Update each lesson in backend
        this.cart.forEach(item => {
          const newSpaces = item.spaces;
          fetch(`http://localhost:3000/lessons/${item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaces: newSpaces })
          });
        });

        this.checkoutMessage = `Order submitted successfully for ${this.name}!`;
        this.cart = [];
        this.name = '';
        this.phone = '';
        setTimeout(() => {
          this.checkoutMessage = '';
          this.showCart = false;
          this.fetchLessons();
        }, 2500);
      });
    },
    fetchLessons() {
      fetch('http://localhost:3000/lessons')
        .then(res => res.json())
        .then(data => {
          this.lessons = data;
        });
    },
    onImageError(e) {
      e.target.src = 'images/default.jpg';
    }
  },
  mounted() {
    this.fetchLessons();
  }
});
