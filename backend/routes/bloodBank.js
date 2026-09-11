const express = require('express');
const router = express.Router();
const BloodBank = require('../models/BloodBank');

// Sample initial demo blood banks
const defaultDemoBloodBanks = [
  {
    id: 'bb_1',
    name: 'City Red Cross Blood Bank',
    address: '12 Medical College Road, Central District',
    city: 'Mumbai',
    phone: '+91 22 2555 0199',
    distanceKm: 2.4,
    inventory: [
      { bloodGroup: 'O+', units: 14, status: 'AVAILABLE' },
      { bloodGroup: 'A+', units: 8, status: 'AVAILABLE' },
      { bloodGroup: 'B+', units: 12, status: 'AVAILABLE' },
      { bloodGroup: 'AB+', units: 3, status: 'CRITICAL' },
      { bloodGroup: 'O-', units: 2, status: 'CRITICAL' },
      { bloodGroup: 'A-', units: 0, status: 'OUT_OF_STOCK' },
      { bloodGroup: 'B-', units: 4, status: 'AVAILABLE' },
      { bloodGroup: 'AB-', units: 1, status: 'CRITICAL' }
    ]
  },
  {
    id: 'bb_2',
    name: 'Apex Lifeline Emergency Blood Center',
    address: '45 Emergency Care Blvd, Sector 4',
    city: 'Mumbai',
    phone: '+91 22 2888 4400',
    distanceKm: 4.8,
    inventory: [
      { bloodGroup: 'O+', units: 22, status: 'AVAILABLE' },
      { bloodGroup: 'A+', units: 15, status: 'AVAILABLE' },
      { bloodGroup: 'B+', units: 19, status: 'AVAILABLE' },
      { bloodGroup: 'AB+', units: 7, status: 'AVAILABLE' },
      { bloodGroup: 'O-', units: 5, status: 'AVAILABLE' },
      { bloodGroup: 'A-', units: 2, status: 'CRITICAL' }
    ]
  },
  {
    id: 'bb_3',
    name: 'Metropolitan General Hospital Blood Storage',
    address: '89 Healthcare Highway, East Division',
    city: 'Mumbai',
    phone: '+91 22 2111 9922',
    distanceKm: 7.1,
    inventory: [
      { bloodGroup: 'O+', units: 5, status: 'CRITICAL' },
      { bloodGroup: 'B+', units: 30, status: 'AVAILABLE' },
      { bloodGroup: 'AB+', units: 10, status: 'AVAILABLE' },
      { bloodGroup: 'O-', units: 0, status: 'OUT_OF_STOCK' }
    ]
  }
];

// @route   GET api/blood-banks
// @desc    Search nearby blood banks and filter by blood group
router.get('/', async (req, res) => {
  try {
    const { bloodGroup, lat, lng } = req.query;

    if (global.isDbConnected) {
      let query = {};
      if (bloodGroup) {
        query['inventory.bloodGroup'] = bloodGroup;
      }
      
      let banks = await BloodBank.find(query);
      if (!banks || banks.length === 0) {
        // Fallback to default demo list if database collection is empty
        banks = defaultDemoBloodBanks;
      }

      if (bloodGroup) {
        banks = banks.map(b => {
          const item = b.inventory?.find(i => i.bloodGroup === bloodGroup);
          return {
            ...b.toObject ? b.toObject() : b,
            requestedUnits: item ? item.units : 0,
            requestedStatus: item ? item.status : 'OUT_OF_STOCK'
          };
        });
      }

      return res.json({ success: true, count: banks.length, data: banks });
    }

    // Demo Mode Return
    let results = defaultDemoBloodBanks;
    if (bloodGroup) {
      results = results.map(b => {
        const item = b.inventory.find(i => i.bloodGroup === bloodGroup);
        return {
          ...b,
          requestedUnits: item ? item.units : 0,
          requestedStatus: item ? item.status : 'OUT_OF_STOCK'
        };
      });
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    console.error('Blood bank fetch error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
