import { parseCookies, destroyCookie } from 'nookies';
import connectToDatabase from '../lib/mongodb';
import Admin from '../models/Admin';
import Member from '../models/Member';

export const authMiddleware = async (ctx) => {
  const { req } = ctx;
  const cookies = parseCookies(ctx);
  const userType = cookies.userType;
  const userId = cookies.userId;

  if (!userId || !userType) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  await connectToDatabase();

  try {
    let user;

    if (userType === 'member') {
      user = await Member.findById(userId).lean(); // Ensure to call .lean() for plain object
    }

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: { user: userType },
    };
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export const adminMiddleware = async (ctx) => {
  const { req } = ctx;
  const cookies = parseCookies(ctx);
  const userType = cookies.userType;
  const userId = cookies.userId;

  if (!userId || !userType) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  await connectToDatabase();

  try {
    let user;

    if (userType === 'admin') {
      user = await Admin.findById(userId).lean(); // Ensure to call .lean() for plain object
    } 

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: { user: userType },
    };
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

// Logout function to clear cookies
export const logout = async (ctx) => {
  const { req } = ctx;
  destroyCookie(ctx, 'userType', { path: '/' });
  destroyCookie(ctx, 'userId', { path: '/' });
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
};
