const BREVO_FORM_ACTION =
  "https://5f97f476.sibforms.com/v2/serve/MUIFACa5WCz3YIdoebcEbBotBCCFwZiSOGXVyXnzqsT-zrrPU5jPRccb9FN26BBOQAAVWRmhHbI2ikVfcPISsnrBNeXxrlHs29ywW3Ve5cgKMQcitms4QKQxeB8JXYZOsgP6EORU8n5_q71WJ0F-DW50QlECxR52p1XYXF0ajLZlno7AlCWt5qXJBPg-2nnMvf-mKehO2cVSz8tVKA==";

type BrevoSignupProps = {
  placement: "submit" | "footer";
};

export function BrevoSignup({ placement }: BrevoSignupProps) {
  const inputId = `brevo-email-${placement}`;

  return (
    <section className={`brevo-signup brevo-signup--${placement}`}>
      <div className="brevo-signup-copy">
        <h2>Stay in the room</h2>
        <p>
          Get ticket drops, selected film announcements, future submission windows, and updates from Filmshow.
        </p>
      </div>
      <form
        id={`sib-form-${placement}`}
        className="brevo-signup-form"
        method="POST"
        action={BREVO_FORM_ACTION}
        data-type="subscription"
      >
        <label className="sr-only" htmlFor={inputId}>
          Email address
        </label>
        <input
          id={inputId}
          className="brevo-signup-input"
          type="email"
          name="EMAIL"
          autoComplete="email"
          placeholder="Email address"
          required
          data-required="true"
        />
        <button className="brevo-signup-submit" type="submit">
          Join the List
        </button>
        <input
          className="brevo-signup-honeypot"
          type="text"
          name="email_address_check"
          defaultValue=""
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <input type="hidden" name="locale" defaultValue="en" />
        <input type="hidden" name="html_type" defaultValue="simple" />
      </form>
    </section>
  );
}
