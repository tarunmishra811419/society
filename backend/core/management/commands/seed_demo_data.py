import secrets
from decimal import Decimal
from django.utils import timezone

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User, ResidentProfile, SecurityProfile
from parking.models import ParkingSlot
from vehicles.models import Vehicle
from visitors.models import Visitor, GuestApproval, Package, StaffPass
from billing.models import MaintenanceFee, SocietyTransaction
from complaints.models import Complaint
from announcements.models import Announcement


class Command(BaseCommand):
    help = "Populates the database with demo residents, vehicles, parking slots, and more — matching the frontend's mock data, so the app has realistic content to click through without typing it all in by hand."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing demo data before recreating it (does NOT touch your own superuser account).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write("Flushing existing demo data...")
            self._flush_demo_data()

        self.stdout.write("Creating parking slots...")
        slots = self._create_parking_slots()

        self.stdout.write("Creating residents...")
        residents = self._create_residents()

        self.stdout.write("Creating security guard...")
        self._create_security()

        self.stdout.write("Ensuring an admin-role account exists...")
        admin = self._ensure_admin()

        self.stdout.write("Creating vehicles...")
        self._create_vehicles(residents, slots)

        self.stdout.write("Creating visitors and guest approvals...")
        self._create_visitors(residents)

        self.stdout.write("Creating maintenance fees...")
        self._create_maintenance_fees(residents)

        self.stdout.write("Creating complaints...")
        self._create_complaints(residents)

        self.stdout.write("Creating announcements...")
        self._create_announcements(admin)

        self.stdout.write("Creating society accounting transactions...")
        self._create_accounting_data(admin)

        self.stdout.write("Creating packages and staff passes...")
        self._create_packages()
        self._create_staff_passes(residents)

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))

    # ---------- helpers ----------

    def _flush_demo_data(self):
        demo_usernames = [
            "ritika_sharma", "arjun_mehta", "priya_nair", "naveen_kumar", "demo_admin",
        ]
        User.objects.filter(username__in=demo_usernames).delete()
        ParkingSlot.objects.all().delete()
        Announcement.objects.all().delete()
        SocietyTransaction.objects.all().delete()
        Package.objects.all().delete()
        StaffPass.objects.all().delete()

    def _create_parking_slots(self):
        layout = [
            ("A-01", "A", ParkingSlot.Status.AVAILABLE),
            ("A-02", "A", ParkingSlot.Status.AVAILABLE),
            ("A-03", "A", ParkingSlot.Status.AVAILABLE),
            ("A-04", "A", ParkingSlot.Status.AVAILABLE),
            ("A-05", "A", ParkingSlot.Status.RESERVED),
            ("A-06", "A", ParkingSlot.Status.AVAILABLE),
            ("B-10", "B", ParkingSlot.Status.AVAILABLE),
            ("B-11", "B", ParkingSlot.Status.AVAILABLE),
            ("B-12", "B", ParkingSlot.Status.AVAILABLE),
            ("B-13", "B", ParkingSlot.Status.AVAILABLE),
            ("B-14", "B", ParkingSlot.Status.RESERVED),
            ("C-20", "C", ParkingSlot.Status.AVAILABLE),
            ("C-21", "C", ParkingSlot.Status.AVAILABLE),
            ("C-22", "C", ParkingSlot.Status.AVAILABLE),
        ]
        slots = {}
        for code, block, status in layout:
            slot, _ = ParkingSlot.objects.get_or_create(
                code=code, defaults={"block": block, "status": status}
            )
            slots[code] = slot
        return slots

    def _create_residents(self):
        data = [
            ("ritika_sharma", "Ritika", "Sharma", "B-204", "9811100001"),
            ("arjun_mehta", "Arjun", "Mehta", "A-101", "9811100002"),
            ("priya_nair", "Priya", "Nair", "C-305", "9811100003"),
        ]
        residents = {}
        for username, first, last, flat, phone in data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"first_name": first, "last_name": last, "role": User.Role.RESIDENT},
            )
            if created:
                user.set_password("demo1234")
                user.save()
            ResidentProfile.objects.get_or_create(
                user=user, defaults={"flat_number": flat, "phone": phone}
            )
            residents[username] = user
        return residents

    def _create_security(self):
        user, created = User.objects.get_or_create(
            username="naveen_kumar",
            defaults={"first_name": "Naveen", "last_name": "Kumar", "role": User.Role.SECURITY},
        )
        if created:
            user.set_password("demo1234")
            user.save()
        SecurityProfile.objects.get_or_create(
            user=user, defaults={"gate": "Main Gate", "shift": "Day (8am–8pm)"}
        )
        return user

    def _ensure_admin(self):
        user, created = User.objects.get_or_create(
            username="demo_admin",
            defaults={"first_name": "Society", "last_name": "Admin", "role": User.Role.ADMIN},
        )
        user.set_password("demo1234")
        user.is_staff = True
        user.is_superuser = True
        user.role = User.Role.ADMIN
        user.save()

        # Also ensure any existing superuser has admin role
        User.objects.filter(is_superuser=True).update(role=User.Role.ADMIN)
        return user

    def _create_vehicles(self, residents, slots):
        ritika = residents["ritika_sharma"]
        arjun = residents["arjun_mehta"]
        priya = residents["priya_nair"]

        vehicle_data = [
            ("UP32 AB 4521", ritika, Vehicle.VehicleType.CAR, "B-12"),
            ("UP32 XY 0099", ritika, Vehicle.VehicleType.TWO_WHEELER, "B-13"),
            ("UP32 CD 7788", arjun, Vehicle.VehicleType.CAR, "A-04"),
            ("UP32 EF 1122", priya, Vehicle.VehicleType.CAR, None),
        ]

        for plate, owner, vtype, slot_code in vehicle_data:
            slot = slots.get(slot_code) if slot_code else None
            vehicle, created = Vehicle.objects.get_or_create(
                plate=plate,
                defaults={
                    "owner": owner,
                    "vehicle_type": vtype,
                    "status": Vehicle.Status.ACTIVE if slot else Vehicle.Status.PENDING,
                    "slot": slot,
                },
            )
            if created and slot:
                slot.status = ParkingSlot.Status.OCCUPIED
                slot.save()

    def _create_visitors(self, residents):
        ritika = residents["ritika_sharma"]
        arjun = residents["arjun_mehta"]

        Visitor.objects.get_or_create(
            qr_code="QR-8891",
            defaults={
                "name": "Deepak Singh",
                "phone": "9876501234",
                "purpose": "Food Delivery (Zomato)",
                "vehicle_number": "KA04 EF 9981",
                "host": ritika,
                "otp": "7105",
                "status": Visitor.Status.CHECKED_IN,
                "checked_in_at": timezone.now(),
            },
        )

        GuestApproval.objects.get_or_create(
            visitor_name="Anjali Gupta",
            requested_by=arjun,
            defaults={
                "phone": "9811234567",
                "purpose": "Family weekend visit",
                "vehicle_number": "UP32 GH 4567",
                "status": GuestApproval.Status.PENDING,
            },
        )

        Visitor.objects.get_or_create(
            qr_code="QR-8893",
            defaults={
                "name": "Rahul Jain",
                "phone": "9899011223",
                "purpose": "Friend visit",
                "vehicle_number": "DL8C AK 1029",
                "host": ritika,
                "otp": "4892",
                "status": Visitor.Status.APPROVED,
            },
        )

    def _create_maintenance_fees(self, residents):
        ritika = residents["ritika_sharma"]
        arjun = residents["arjun_mehta"]
        priya = residents["priya_nair"]

        breakdown_sample = {
            "Base Maintenance": 2400.0,
            "Water & Sanitation": 320.0,
            "Sinking Fund": 256.0,
            "Common Area Electricity": 224.0,
        }

        fee_data = [
            (ritika, "August 2026", 3200, MaintenanceFee.Status.PAID, "REC-2026-0001", "upi", "order_test_aug_ritika"),
            (ritika, "September 2026", 3200, MaintenanceFee.Status.DUE, None, None, ""),
            (arjun, "September 2026", 3200, MaintenanceFee.Status.DUE, None, None, ""),
            (arjun, "August 2026", 3200, MaintenanceFee.Status.OVERDUE, None, None, ""),
            (priya, "July 2026", 3200, MaintenanceFee.Status.OVERDUE, None, None, ""),
        ]
        for resident, period, amount, status, rec_num, method, ref in fee_data:
            fee, created = MaintenanceFee.objects.get_or_create(
                resident=resident,
                period=period,
                defaults={
                    "amount": Decimal(amount),
                    "status": status,
                    "receipt_number": rec_num,
                    "payment_method": method or "",
                    "payment_reference": ref,
                    "breakdown_json": breakdown_sample,
                },
            )
            if fee.status == MaintenanceFee.Status.PAID:
                SocietyTransaction.objects.get_or_create(
                    reference_no=ref or f"ref_{period}",
                    defaults={
                        "entry_type": SocietyTransaction.EntryType.INCOME,
                        "category": SocietyTransaction.Category.MAINTENANCE,
                        "title": f"Maintenance Collection - {resident.get_full_name()} (Flat {resident.resident_profile.flat_number})",
                        "amount": Decimal(amount),
                        "date": "2026-08-05",
                        "description": f"August maintenance collection via {method.upper()}",
                        "recorded_by": resident,
                    },
                )

    def _create_complaints(self, residents):
        ritika = residents["ritika_sharma"]
        priya = residents["priya_nair"]

        complaint_data = [
            ("Leaking pipe in basement parking", Complaint.Category.PLUMBING, ritika, Complaint.Status.IN_PROGRESS),
            ("Street light near Block C not working", Complaint.Category.ELECTRICAL, priya, Complaint.Status.OPEN),
        ]
        for title, category, resident, status in complaint_data:
            Complaint.objects.get_or_create(
                title=title, raised_by=resident,
                defaults={"category": category, "status": status},
            )

    def _create_announcements(self, admin):
        announcement_data = [
            ("Water supply interruption — Aug 20", "Water supply will be suspended 10am–2pm for tank cleaning.", Announcement.Priority.NORMAL),
            ("Fire drill — mandatory", "All residents must participate in the fire safety drill, 5pm at the main lawn.", Announcement.Priority.URGENT),
        ]
        for title, body, priority in announcement_data:
            Announcement.objects.get_or_create(
                title=title, defaults={"body": body, "priority": priority, "posted_by": admin},
            )

    def _create_accounting_data(self, admin):
        transactions = [
            (
                SocietyTransaction.EntryType.EXPENSE,
                SocietyTransaction.Category.SECURITY,
                "Apex Security Services — August Guard Salaries",
                Decimal("28000.00"),
                "2026-08-01",
                "Four 24/7 gate and patrol security guards monthly payroll",
                "EXP-2026-0801",
            ),
            (
                SocietyTransaction.EntryType.EXPENSE,
                SocietyTransaction.Category.UTILITIES,
                "Common Area Electricity (BESCOM Invoice)",
                Decimal("14250.00"),
                "2026-08-08",
                "Power bill for lifts, corridor lighting, and water pumps",
                "EXP-2026-0802",
            ),
            (
                SocietyTransaction.EntryType.EXPENSE,
                SocietyTransaction.Category.REPAIRS,
                "Otis Elevator AMC Quarterly Service",
                Decimal("18500.00"),
                "2026-08-12",
                "Scheduled quarterly lift servicing and motor inspection",
                "EXP-2026-0803",
            ),
            (
                SocietyTransaction.EntryType.EXPENSE,
                SocietyTransaction.Category.HOUSEKEEPING,
                "CleanZone Housekeeping & Waste Disposal",
                Decimal("9800.00"),
                "2026-08-15",
                "Daily garbage collection, corridor mopping, sanitization",
                "EXP-2026-0804",
            ),
            (
                SocietyTransaction.EntryType.EXPENSE,
                SocietyTransaction.Category.GARDENING,
                "GreenThumb Landscaping & Lawn Maintenance",
                Decimal("6500.00"),
                "2026-08-18",
                "Lawn mowing, seasonal flowering plants, tree trimming",
                "EXP-2026-0805",
            ),
            (
                SocietyTransaction.EntryType.INCOME,
                SocietyTransaction.Category.FACILITY,
                "Clubhouse Party Hall Booking (Flat A-101)",
                Decimal("5000.00"),
                "2026-08-20",
                "Birthday party rental fee and cleaning deposit",
                "INC-2026-0801",
            ),
            (
                SocietyTransaction.EntryType.EXPENSE,
                SocietyTransaction.Category.ADMIN,
                "Society Annual Audit & CA Certification",
                Decimal("12000.00"),
                "2026-08-25",
                "Audit preparation and registrar filing fee",
                "EXP-2026-0806",
            ),
        ]

        for entry_type, category, title, amount, date_str, desc, ref in transactions:
            SocietyTransaction.objects.get_or_create(
                reference_no=ref,
                defaults={
                    "entry_type": entry_type,
                    "category": category,
                    "title": title,
                    "amount": amount,
                    "date": date_str,
                    "description": desc,
                    "recorded_by": admin,
                },
            )

    def _create_packages(self):
        packages = [
            ("Amazon", "Amazon Logistics", "B-204", "Ramesh Kumar", "9811002233", Package.Status.WAITING, "1024"),
            ("Swiggy", "Instamart Delivery", "A-101", "Imran Ali", "9876543210", Package.Status.WAITING, "4491"),
            ("Zomato", "Delivery Partner", "C-305", "Suresh Das", "9988776655", Package.Status.COLLECTED, "8821"),
            ("Flipkart", "Ekart Logistics", "B-204", "Sunil Yadav", "9822334455", Package.Status.COLLECTED, "9102"),
        ]
        for company, courier, flat, agent_name, agent_phone, status, pin in packages:
            Package.objects.get_or_create(
                flat_number=flat,
                courier=courier,
                defaults={
                    "company": company,
                    "delivery_person_name": agent_name,
                    "delivery_person_phone": agent_phone,
                    "status": status,
                    "tracking_pin": pin,
                    "has_photo": True,
                },
            )

    def _create_staff_passes(self, residents):
        from datetime import timedelta
        ritika = residents["ritika_sharma"]
        arjun = residents["arjun_mehta"]
        priya = residents["priya_nair"]

        passes = [
            (ritika, "Shanti Devi", "9811122334", StaffPass.Role.MAID, "SQR-881A", 180),
            (ritika, "Ramesh Chandra", "9822233445", StaffPass.Role.COOK, "SQR-882B", 90),
            (arjun, "Manoj Sharma", "9833344556", StaffPass.Role.DRIVER, "SQR-883C", 120),
            (priya, "Sunita Kumari", "9844455667", StaffPass.Role.NANNY, "SQR-884D", 15),
        ]
        for owner, name, phone, role, qr, days in passes:
            StaffPass.objects.get_or_create(
                qr_code=qr,
                defaults={
                    "owner": owner,
                    "name": name,
                    "phone": phone,
                    "role": role,
                    "valid_till": timezone.now().date() + timedelta(days=days),
                },
            )