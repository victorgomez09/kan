// import type { EmailOtpType } from "@supabase/supabase-js";
// import type { NextApiRequest } from "next";
// import { NextResponse } from "next/server";

// import { createDrizzleClient } from "@kan/db/client";
// import * as memberRepo from "@kan/db/repository/member.repo";
// import * as userRepo from "@kan/db/repository/user.repo";
// import { stripe } from "@kan/stripe";
// import { createNextApiClient } from "@kan/";

// export default async function handler(req: NextApiRequest) {
//   if (req.method !== "GET") {
//     return new NextResponse(null, {
//       status: 405,
//       headers: { Allow: "GET" },
//     });
//   }

//   if (!req.url) {
//     return new NextResponse(null, {
//       status: 400,
//     });
//   }

//   const url = new URL(req.url);
//   const queryParams = Object.fromEntries(url.searchParams.entries());

//   const tokenHash = queryParams.token_hash;
//   const type = queryParams.type;
//   const code = queryParams.code;
//   const memberPublicId = queryParams.memberPublicId;

//   let next = "/error";

//   let authRes;

//   const response = NextResponse.next();

//   if ((tokenHash && type) ?? code) {
//     const supabaseClient = createNextClient(req, response);

//     if (tokenHash && type) {
//       authRes = await supabaseClient.auth.verifyOtp({
//         type: type as EmailOtpType,
//         token_hash: tokenHash,
//       });
//     }

//     if (code) {
//       authRes = await supabaseClient.auth.exchangeCodeForSession(code);
//     }

//     const user = authRes?.data.user;

//     const db = createDrizzleClient();

//     if (user?.id && user.email) {
//       const existingUser = await userRepo.getById(db, user.id);

//       if (!existingUser) {
//         const stripeCustomer = await stripe.customers.create({
//           email: user.email,
//           metadata: {
//             userId: user.id,
//           },
//         });

//         await userRepo.create(db, {
//           id: user.id,
//           email: user.email,
//           stripeCustomerId: stripeCustomer.id,
//         });
//       }
//     }

//     if (memberPublicId) {
//       const member = await memberRepo.getByPublicId(db, memberPublicId);

//       if (member?.id) {
//         await memberRepo.acceptInvite(db, member.id);
//       }
//     }

//     if (authRes?.error) {
//       console.error(authRes.error);
//     } else {
//       next = queryParams.next ?? "/boards";
//     }
//   }

//   const redirectResponse = NextResponse.redirect(new URL(next, req.url));

//   response.headers.getSetCookie().forEach((cookie) => {
//     redirectResponse.headers.append("Set-Cookie", cookie);
//   });

//   return redirectResponse;
// }
