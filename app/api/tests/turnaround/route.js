import { connectDB } from '@/lib/mongodb';
import TestOrder from '@/models/TestOrder';
import Sample from '@/models/Sample';
import TestResult from '@/models/TestResult';
import { isAuthenticated } from '@/hoc/protectedRoute';

export async function GET(req) {
  const auth = await isAuthenticated(req, ['labtech']);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find all test results related to this user’s test orders (doctor or labtech)
    // Adjust filtering according to user role & permissions as needed

    // Fetch test results with populated linked info
    const results = await TestResult.find()
      .populate({
        path: 'testOrderId',
        select: 'createdAt',
      })
      .populate({
        path: 'sample',
        select: 'collectionTime',
      })
      .sort({ recordedAt: -1 });

    // Calculate turnaround times
    const data = results.map((result) => {
      const orderDate = result.testOrderId?.createdAt;
      const collectionDate = result.sample?.collectionTime;
      const recordedDate = result.recordedAt;
      const approvedDate = result.approvedAt || null;
    
    console.log('Order Date:', orderDate);
    console.log('Collection Date:', collectionDate);        
    console.log('Recorded Date:', recordedDate);
    console.log('Approved Date:', approvedDate);

      // Turnaround times in hours
      const orderToCollection = collectionDate && orderDate ? (collectionDate - orderDate) / (1000 * 3600) : null;
      const collectionToResult = recordedDate && collectionDate ? (recordedDate - collectionDate) / (1000 * 3600) : null;
      const orderToResult = recordedDate && orderDate ? (recordedDate - orderDate) / (1000 * 3600) : null;
      const resultToApproval = approvedDate && recordedDate ? (approvedDate - recordedDate) / (1000 * 3600) : null;
      const orderToApproval = approvedDate && orderDate ? (approvedDate - orderDate) / (1000 * 3600) : null;

      return {
        testResultId: result._id,
        testName: result.testName,
        orderDate,
        collectionDate,
        recordedDate,
        approvedDate,
        turnaroundHours: {
          orderToCollection,
          collectionToResult,
          orderToResult,
          resultToApproval,
          orderToApproval,
        },
      };
    });

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error calculating turnaround times:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
