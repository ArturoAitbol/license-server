package com.function.clients;

import com.function.util.ActiveDirectory;
import com.microsoft.azure.functions.ExecutionContext;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import java.io.*;
import java.util.Date;
import java.util.Properties;
import java.util.stream.Collectors;

public class EmailClient {
    private static Session session;

    public static void sendSpotlightWelcomeEmail(String toEmail, String customerName, ExecutionContext context){
        try {
            String html = getResourceFileAsString("/invitation-emails/spotlight-welcome-invitation.html");
            context.getLogger().info("Loading spotlight invitation html");
            if (html != null) {
                html = html.replace("%CUSTOMER_NAME%", customerName);
                sendEmail(toEmail,"Welcome to tekVizion UCaaS Continuous Testing", html, context);
            }
        } catch (Exception e) {
            context.getLogger().severe("Could not send UCaaS Continuous Testing welcome email: " + e);
        }
    }

    public static void sendSpotlightReadyEmail(String toEmail, String customerName, ExecutionContext context){
        try {
            String html = getResourceFileAsString("/invitation-emails/spotlight-service-ready-invitation.html");
            context.getLogger().info("Loading spotlight invitation html");
            if (html != null) {
                html = html.replace("%CUSTOMER_NAME%", customerName);
                String inviteRedirectUrl = ActiveDirectory.INSTANCE.getEmailInviteUrl();
                html = html.replace("%REDIRECT_URL%", inviteRedirectUrl);
                sendEmail(toEmail,"Welcome to tekVizion UCaaS Continuous Testing", html, context);
            }
        } catch (Exception e) {
            context.getLogger().severe("Could not send UCaaS Continuous Testing welcome email: " + e);
        }
    }

    public static void sendStakeholderWelcomeEmail(String toEmail, String customerName, String stakeholderName, ExecutionContext context){
        try {
            String html = getResourceFileAsString("/invitation-emails/stakeholder-welcome-invitation.html");
            context.getLogger().info("Loading Stakeholder invitation html");
            if (html != null) {
                html = html.replace("%CUSTOMER_NAME%", customerName);
                html = html.replace("%STAKE_HOLDER_NAME%", stakeholderName);
                String inviteRedirectUrl = ActiveDirectory.INSTANCE.getEmailInviteUrl();
                html = html.replace("%REDIRECT_URL%", inviteRedirectUrl);
                sendEmail(toEmail,"Welcome to tekVizion UCaaS Continuous Testing", html, context);
            }
        } catch (Exception e) {
            context.getLogger().severe("Could not send Stakeholder welcome email: " + e);
        }
    }

    public static void sendAdminInvite(String toEmail, String customerName, ExecutionContext context){
        try {
            String html = getResourceFileAsString("/invitation-emails/admin-welcome-invitation.html");
            context.getLogger().info("Loading admin invitation html");
            if (html != null) {
                html = html.replace("%CUSTOMER_NAME%", customerName);
                String inviteRedirectUrl = ActiveDirectory.INSTANCE.getEmailInviteUrl();
                html = html.replace("%REDIRECT_URL%", inviteRedirectUrl);
                sendEmail(toEmail,"Welcome to tekVizion 360 Portal", html, context);
            }
        } catch (Exception e) {
            context.getLogger().severe("Could not send admin welcome email: " + e);
        }
    }

    public static void sendMaintenanceModeEnabledAlert(String emailList, String customerName, ExecutionContext context) {
        try {
            String html = getResourceFileAsString("/maintenance-mode-emails/maintenance-mode-enabled.html");
            context.getLogger().info("Loading maintenance enabled alert html");
            if (html != null) {
                html = html.replace("%CUSTOMER_NAME%", customerName);
                String subject = "UCaaS Continuous Testing Service for " + customerName + " is under maintenance.";
                sendEmail(emailList,subject, html, context);
            }
        } catch (Exception e) {
            context.getLogger().severe("Could not send admin welcome email: " + e);
        }
    }

    public static void sendMaintenanceModeDisabledAlert(String emailList, String customerName, ExecutionContext context) {
        try {
            String html = getResourceFileAsString("/maintenance-mode-emails/maintenance-mode-disabled.html");
            context.getLogger().info("Loading maintenance disabled alert html");
            if (html != null) {
                String inviteRedirectUrl = ActiveDirectory.INSTANCE.getEmailInviteUrl();
                html = html.replace("%REDIRECT_URL%", inviteRedirectUrl);
                html = html.replace("%CUSTOMER_NAME%", customerName);
                String subject = "Maintenance of UCaaS Continuous Testing Service for " + customerName + " is complete and is now fully operational.";
                sendEmail(emailList,subject, html, context);
            }
        } catch (Exception e) {
            context.getLogger().severe("Could not send admin welcome email: " + e);
        }
    }

    public static void sendEmail(String emailList, String subject, String html, ExecutionContext context) throws MessagingException{
            MimeMessage msg = new MimeMessage(getSession());
            //set message headers
            msg.addHeader("Content-type", "text/HTML; charset=UTF-8");
            msg.addHeader("format", "flowed");
            msg.addHeader("Content-Transfer-Encoding", "8bit");
            msg.setSubject(subject, "UTF-8");
            msg.setSentDate(new Date());
            msg.setFrom(new InternetAddress(System.getenv("SMTP_USER")));
            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(emailList, false));

            // Create a multipart message
            Multipart multipart = new MimeMultipart("related");
            MimeBodyPart messageBodyPart = new MimeBodyPart();
            messageBodyPart.setText(html, "utf-8", "html");
            multipart.addBodyPart(messageBodyPart);

            msg.setContent(multipart);

            context.getLogger().info("Email is ready");
            Transport.send(msg);
            context.getLogger().info("Email sent successfully");
    }


    private static Session getSession(){
        if (session == null) {
            Properties props = new Properties();
            props.put("mail.smtp.host", System.getenv("SMTP_HOST"));
            props.put("mail.smtp.port", "587"); //TLS Port
            props.put("mail.smtp.auth", "true"); //enable authentication
            props.put("mail.smtp.starttls.enable", "true"); //enable STARTTLS
            Authenticator auth = new Authenticator() {
                //override the getPasswordAuthentication method
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(System.getenv("SMTP_USER"), System.getenv("SMTP_PWD"));
                }
            };
            session = Session.getInstance(props, auth);
        }
        return session;
    }

    static String getResourceFileAsString(String fileName) throws IOException {
        try (InputStream is = EmailClient.class.getResourceAsStream(fileName)) {
            if (is == null) return null;
            try (InputStreamReader isr = new InputStreamReader(is);
                 BufferedReader reader = new BufferedReader(isr)) {
                return reader.lines().collect(Collectors.joining(System.lineSeparator()));
            }
        }
    }
}
