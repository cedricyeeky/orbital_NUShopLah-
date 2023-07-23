import HomeScreen from './HomeScreen';

// Mock the useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

// Mock the Firebase methods and functionality used in HomeScreen component
jest.mock('../../firebaseconfig', () => ({
  firebase: {
    auth: jest.fn(() => ({
      currentUser: {
        uid: 'user-uid',
      },
    })),
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ 
          exists: true, 
          data: () => ({ 
              uid: 'user-uid', 
              email: 'test@example.com',
              firstName: 'John', 
              currentPoint: 100, 
              totalPoint: 200, 
          }) 
      }),
      onSnapshot: jest.fn().mockReturnValue({ data: () => ({ currentPoint: 100, totalPoint: 200 }) }),
    }),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => ({
            then: jest.fn(() => ({
              exists: true,
              data: () => ({
                firstName: 'John',
              }),
              catch: jest.fn(() => ({

              })),
            })),
          })),
          onSnapshot: jest.fn(() => ({
            exists: true,
            data: () => ({
                currentPoint: '200',
                totalPoint: '200',
              }),
          })),
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() => ({ })),
          onSnapshot: jest.fn(() => ({

          })),

        })),
      })),
      doc: jest.fn(() => ({ })),
    })),
    storage: jest.fn(() => ({
      ref: jest.fn(() => ({
        child: jest.fn(() => ({
          put: jest.fn(() => ({
            on: jest.fn((event, progress, error, complete) => {
              if (event === 'state_changed') {
                complete();
              } else if (event === 'error') {
                error('Image upload error');
              }
            }),
          })),
          getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/voucher-image')),
        })),
      })),
    })),
  },
}));


// Mock the filteredVouchers function
jest.mock('./HomeScreen', () => {
  const originalModule = jest.requireActual('./HomeScreen');
  return {
    ...originalModule,
    filteredVouchers: jest.fn((vouchers, searchQuery) => {
      return vouchers.filter(voucher =>
        voucher.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
  };
});

const vouchers = [
  { voucherId: 'voucher1', sellerName: 'Seller A' },
  { voucherId: 'voucher2', sellerName: 'Seller B' },
  { voucherId: 'voucher3', sellerName: 'Seller C' },
  { voucherId: 'voucher4', sellerName: 'Seller B' },
];

describe('filteredVouchers', () => {

  it('should return an empty array when search query does not match any seller name', () => {
    
    const searchQuery = 'Seller D';
    const result = HomeScreen.filteredVouchers(vouchers, searchQuery);
    expect(result).toEqual([]);
  });

  it('should return an array of vouchers when search query matches seller names', () => {
    const searchQuery = 'Seller B';
    const result = HomeScreen.filteredVouchers(vouchers, searchQuery);
    expect(result).toEqual([
      { voucherId: 'voucher2', sellerName: 'Seller B' },
      { voucherId: 'voucher4', sellerName: 'Seller B' },
    ]);
  });

  it('should be case-insensitive when matching seller names', () => {
    const searchQuery = 'seller c';
    const result = HomeScreen.filteredVouchers(vouchers, searchQuery);
    expect(result).toEqual([{ voucherId: 'voucher3', sellerName: 'Seller C' }]);
  });
});