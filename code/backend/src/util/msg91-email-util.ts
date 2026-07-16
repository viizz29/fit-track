const url = new URL('https://control.msg91.com/api/v5/email/send');

export interface EmailRecipient {
  email: string;
  name: string;
}

const sendEmailThroughMsg91 = async (
  templateId: string,
  variables: Record<string, string>,
  to: EmailRecipient[],
) => {
  const { MSG91_AUTH_KEY, MAILING_DOMAIN_FOR_MSG91 } = process.env;

  if (!MSG91_AUTH_KEY) {
    console.log('Msg91 auth key not defined !');
    return;
  }

  if (!MAILING_DOMAIN_FOR_MSG91) {
    console.log('MAILING_DOMAIN_FOR_MSG91 not defined !');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    authkey: MSG91_AUTH_KEY,
  };

  const body = {
    recipients: [
      {
        to,
        variables,
      },
    ],
    from: {
      email: `no-reply@${MAILING_DOMAIN_FOR_MSG91}`,
    },
    domain: MAILING_DOMAIN_FOR_MSG91,
    template_id: templateId,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log(`Msg91 email API responded with status ${response.status}`);
  }

  console.log(await response.json());
};

export class MSG91 {
  public static async sendOtpThroughEmail(
    name: string,
    email: string,
    otp: string,
  ) {
    const templateId = 'global_otp';
    const company_name = 'Fitrack';
    await sendEmailThroughMsg91(templateId, { otp, company_name }, [
      { name, email },
    ]);
  }

  public static async sendPasswordResetEmail(
    name: string,
    email: string,
    token: string,
  ) {
    const { PUBLIC_HOST_WITH_PORT } = process.env;

    const templateId = 'password_reset_62';
    const company_name = 'Fitrack';
    const reset_link = `${PUBLIC_HOST_WITH_PORT}/reset-password?token=${token}`;
    await sendEmailThroughMsg91(
      templateId,
      { verification_link: reset_link, company_name, name },
      [{ name, email }],
    );
  }

  public static async sendVerificationEmail(
    name: string,
    email: string,
    token: string,
  ) {
    const { PUBLIC_HOST_WITH_PORT } = process.env;

    const templateId = 'email_verification_new_3';
    const company_name = 'Fitrack';
    const verification_link = `${PUBLIC_HOST_WITH_PORT}/verify-email?token=${token}`;
    await sendEmailThroughMsg91(
      templateId,
      { verification_link, company_name, name },
      [{ name, email }],
    );
  }

  public static async sendUpcomingTaskNotification(
    name: string,
    email: string,
    task_name: string,
    task_description: string,
  ) {
    const templateId = 'upcoming_task';
    await sendEmailThroughMsg91(
      templateId,
      { task_name, task_description, name },
      [{ name, email }],
    );
  }

  public static async sendMissedTaskNotification(
    name: string,
    email: string,
    task_name: string,
    task_description: string,
  ) {
    const templateId = 'missed_task';
    await sendEmailThroughMsg91(
      templateId,
      { task_name, task_description, name },
      [{ name, email }],
    );
  }
}
