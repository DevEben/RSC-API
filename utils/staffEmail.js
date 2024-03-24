const staffEmailHTML = (businessName, firstName, lastName, email, password) => {
    return `

    
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>staffEmail</title>
    </head>
    <body>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td style="text-align:center; display: flex; justify-content: center; align-items: center; flex-direction: column;">
                    <img src="https://res.cloudinary.com/dx6qmw7w9/image/upload/v1707374851/Rapid_Stock_Control_2_q13o0l.png" alt="" width="100">
                    <h3 style="font-size: 30px; color: #0098e1;">${businessName}</h3>
                    <h2 style="font-size: 25px; color: #0098e1; font-weight: bold;">Welcome On Board, ${firstName} ${lastName}!</h2>
                    <p style="font-size: 18px;">Below are your account details:</p>
                    <div style="width: max-content; height: 70px; display: flex; text-align: left; background-color: #009ae122; padding-inline: 15px; border-radius: 7px;">
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Password:</strong> ${password}</li>
                        </ul>
                    </div>
                    <h5 style="font-family: 'Lato', sans-serif; font-size: 18px; font-weight: 300;">Please <a href="https:rapid-stock-control-osqb.onrender.com/staff/staffLogin"> click here </a> to log in to your account</h5>
                    <p style="font-size: 15px;">Feel free to change your password anytime you like!</p>
                    <p style="font-size: 12px;">&copy; Copyright ${new Date().getFullYear()}. All rights reserved. Rapid Stock Control.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>

    `;
}

module.exports = { staffEmailHTML };
