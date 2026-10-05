/* ============================================================
   BOOKING FLOW — State pattern
   The booking wizard is modelled as an explicit state machine.
   Each state (step) declares:
     - whether the user may leave it going forward (isComplete)
     - which state comes next / before
   The page simply asks the flow object what to render and
   whether "Continue" should be enabled. Invalid jumps are
   impossible by construction.
   ============================================================ */

export const STEPS = ['service', 'datetime', 'details', 'confirm'];

export const STEP_META = {
  service:  { label: 'Service',     title: 'Choose a service' },
  datetime: { label: 'Date & time', title: 'Pick a date and time' },
  details:  { label: 'Your details', title: 'Tell us who\u2019s coming' },
  confirm:  { label: 'Confirm',     title: 'Review and confirm' },
};

export class BookingFlow {
  constructor(draft = null) {
    this.step = draft?.step || 'service';
    this.data = draft?.data || {
      serviceId: null,
      date: null,
      time: null,
      customer: { name: '', phone: '', email: '', notes: '' },
    };
  }

  /* --- state checks --- */
  isComplete(step) {
    const d = this.data;
    switch (step) {
      case 'service':  return !!d.serviceId;
      case 'datetime': return !!(d.date && d.time);
      case 'details':  return !!(d.customer.name && d.customer.phone);
      case 'confirm':  return false;
      default:         return false;
    }
  }

  stepIndex() { return STEPS.indexOf(this.step); }

  canGoTo(step) {
    // a step is reachable only if every earlier step is complete
    const target = STEPS.indexOf(step);
    return STEPS.slice(0, target).every((s) => this.isComplete(s));
  }

  /* --- transitions --- */
  next() {
    const i = this.stepIndex();
    if (this.isComplete(this.step) && i < STEPS.length - 1) {
      this.step = STEPS[i + 1];
      return true;
    }
    return false;
  }

  back() {
    const i = this.stepIndex();
    if (i > 0) { this.step = STEPS[i - 1]; return true; }
    return false;
  }

  goTo(step) {
    if (this.canGoTo(step)) { this.step = step; return true; }
    return false;
  }

  /* --- mutations --- */
  selectService(id) {
    if (this.data.serviceId !== id) {
      // changing service invalidates a chosen slot (durations differ)
      this.data.time = null;
    }
    this.data.serviceId = id;
  }

  selectDate(dateStr) {
    if (this.data.date !== dateStr) this.data.time = null;
    this.data.date = dateStr;
  }

  selectTime(time) { this.data.time = time; }

  setCustomer(patch) { Object.assign(this.data.customer, patch); }

  serialize() { return { step: this.step, data: this.data }; }
}
