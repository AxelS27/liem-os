import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  displayName?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  displayName = 'User',
  loginUrl = 'https://example.com/login',
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {displayName}!</Heading>
          <Section style={section}>
            <Text style={text}>
              Thank you for joining our platform. We're excited to have you on board!
            </Text>
            <Text style={text}>
              You can access your account and start exploring the features by clicking the button
              below:
            </Text>
            <a href={loginUrl} style={button}>
              Go to Dashboard
            </a>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you did not create this account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// Elegant Styling (Vanilla CSS objects compatible with react-email)
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
};

const section = {
  padding: '24px 0 0',
};

const text = {
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '200px',
  marginTop: '16px',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
};

const footer = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#8f9b9d',
};
