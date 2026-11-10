"""Editorial content for the MaxFoot trike descriptions.

Everything that is a FACT (specs, feature copy, FAQ, metric tiles) is pulled
straight out of the Shopify template by build.py, so it can never drift from
the live page. What lives here is the editorial layer: the lede, the
at-a-glance highlights, the "who is this for" list and the selling points
that the templates imply but do not state outright.

STORE POLICY - copy only what the live site already claims:
  * templates/index.json (homepage FAQ): "Maxfoot provides a 2-year limited
    warranty on all core components, including the frame, motor, battery, and
    controller."
  * templates/index.json (trust badge): "2-Year Warranty - Motor, battery,
    frame. US-based support team."
  * sections/footer-group.json (live footer tagline): "Ships from our US
    warehouse with a 2-year warranty."  (the merchant edited the schema
    default, which still said "and 14-day free trial" - there is NO free
    trial.)
  * templates/index.json (hero): "Ships from US warehouse - free 2-7 day in
    48 states"; homepage FAQ: "FREE shipping to the contiguous United States
    (excluding AK, HI, and remote areas)".

Do NOT add a trial period, a free-trial badge, or a return window that the
site does not already state. check.py / push.py refuse to publish one.
"""
from __future__ import annotations

# Wording shared by every description. One place, so a policy change is a
# one-line edit here rather than twelve.
POLICY = {
    "warranty": "2-year limited warranty on the frame, motor, battery and controller",
    "warranty_short": "2-Year Warranty",
    "shipping": "free US shipping to the contiguous United States (excluding AK, HI "
                 "and remote areas); orders are delivered in 2-7 business days from the "
                 "California warehouse",
    "support": "US-based support team",
    "returns": "see the store refund policy for the current return window, approval "
               "process and any handling fees: https://maxfoot.bike/policies/refund-policy",
}

FAMILIES = {
    "mf-30": {
        "model": "MF-30",
        "product_name": "MaxFoot MF-30 Electric Tricycle For Adults",
        "category": "Electric Tricycle For Adults",
        "family_label": "MF-30 Rear Drive Electric Trike",
        "keywords": ["Adults Electric Trike", "Stable Riding Cargo E-Trike",
                     "Maxfoot Electric Trike", "Rear Drive Electric Trike"],
        "lede": (
            "The MaxFoot MF-30 is a step-through electric tricycle for adults: a 750W rear-wheel "
            "drive brushless geared motor (1,400W peak, 85 N&middot;m torque), a UL-certified "
            "SAMSUNG 48V 20Ah lithium battery good for up to 85+ miles on a single charge, Shimano "
            "7-speed shifting, and a 350 lb rider rating plus a 100 lb rear rack. It ships 85% "
            "pre-assembled with the battery, front basket and 48L waterproof rear basket bag "
            "included."),
        "metric_bodies": {
            "Rear Drive Motor": "The MAXFOOT motor gives the MF-30 a rated power of 750W, peak power "
                                "of 1400W and 85 N&middot;m of torque, mounted on the rear wheel so both "
                                "rear wheels drive the trike in a push mode.",
            "UL-Certified Battery": "A UL-certified SAMSUNG 48V 20Ah high-capacity battery powers the "
                                    "MF-30 for up to 85+ miles on a single charge with pedal assist level 1.",
            "Payload Capacity": "Load up to 350 lbs on the trike plus another 100 lbs on the rear rack, "
                                "and enjoy the stable, balanced ride.",
            "Motor Torque": "Because the motor drives the two rear wheels, the front wheel no longer "
                            "slips on tricky terrain: 40% more driving efficiency and 40% better "
                            "gradeability than a front hub motor.",
        },
        "highlights": [
            ("750W rear-wheel drive motor", "Rated 750W with 1,400W peak power and 85 N&middot;m of "
             "torque, driving the two rear wheels in a push mode so the front wheel does not slip on "
             "rough ground."),
            ("85+ mile range", "A UL-certified SAMSUNG 48V 20Ah lithium battery delivers up to 85+ "
             "miles on pedal assist level 1, and is rated for 800 charge cycles."),
            ("450 lbs of carrying capacity", "350 lbs on the trike plus 100 lbs on the rear rack, with "
             "a 48L waterproof basket bag over the rear basket for groceries and gear."),
            ("Fat tires and front suspension", "Front 24\" x 4.0\" and rear 20\" x 4.0\" fat tires on "
             "a 50mm max travel suspension fork keep control on uneven ground."),
            ("Stable three-wheel geometry", "A rear differential adjusts the speed difference between "
             "the left and right wheels, so the trike stays balanced and safe through turns and special "
             "terrain."),
            ("Comfort for longer rides", "A thickened saddle with backrest, a step-through frame "
             "anyone can get on and off, and an adjustable 44.3\" - 46.5\" handlebar height."),
        ],
        "who": [
            "<strong>Long-range riders</strong> &mdash; up to 85+ miles per charge means a single "
            "charge can cover a full day of errands or a long weekend loop.",
            "<strong>Commuters</strong> &mdash; step-through frame, fat tires and a 750W rear drive "
            "motor carry you beyond traffic without draining you on the way.",
            "<strong>Senior and limited-mobility riders</strong> &mdash; a low step-through frame, a "
            "saddle with backrest and a 50mm suspension fork make mounting and riding comfortable.",
            "<strong>Haulers</strong> &mdash; 350 lbs on the trike, 100 lbs on the rear rack and a "
            "48L waterproof basket bag for groceries, tools or camping gear.",
            "<strong>Off-road and all-terrain riders</strong> &mdash; 24\" x 4.0\" front and 20\" x "
            "4.0\" rear fat tires plus a rear differential keep the trike planted and stable.",
        ],
        "warranty": POLICY["warranty"],
        "warranty_short": POLICY["warranty_short"],
        "assurance": "Ships 85% pre-assembled; only simple components need to be fitted.",
        "key_facts": ["85+ MI RANGE", "750W REAR DRIVE", "48V 20AH SAMSUNG",
                      "350 + 100 LBS PAYLOAD", "9-10 HR CHARGE"],
    },

    "mf-31": {
        "model": "MF-31",
        "product_name": "MaxFoot MF-31 MaxZ 20\" Fat Tire Electric Trikes For Adults",
        "category": "Fat Tire Electric Trikes For Adults",
        "family_label": "MaxZ 20\" Step-Thru Electric Trike",
        "keywords": ["Cargo Electric Trike", "Electric Trike for Seniors",
                     "Maxfoot Electric Trike", "Rear Drive Electric Trike"],
        "lede": (
            "The MaxFoot MF-31 MaxZ 20\" is a step-through fat tire electric tricycle for adults: a "
            "750W rear-wheel drive brushless geared motor (1,400W peak, 85 N&middot;m torque), a "
            "UL-certified SAMSUNG 48V 20Ah lithium battery good for up to 85+ miles per charge, "
            "Shimano 7-speed shifting, and a 350 lb rider rating plus a 100 lb rear rack. It ships "
            "85% pre-assembled with the battery, front basket and rear basket included."),
        "metric_bodies": {
            "Rear Drive Motor": "The MAXFOOT motor gives the MAXZ 20\" electric trike a rated power of "
                                "750W, peak power of 1400W and a powerful torque of 85N.m. In the new "
                                "version in 2024 the motor moved to the rear wheel, so the vehicle is "
                                "driven by the two rear wheels in a push mode.",
            "UL-Certified Battery": "A UL-certified SAMSUNG 48V 20Ah high-capacity battery powers the "
                                    "MAXZ 20\" for around 85+ miles on a single charge with pedal "
                                    "assist level 1.",
            "Payload Capacity": "Load up to 350 lbs on the trike plus another 100 lbs on the rear rack. "
                                "Net weight is 90 lbs and gross weight 100 lbs, so the trike stays easy "
                                "to handle while carrying real cargo.",
            "Motor Torque": "20\" x 4.0\" fat tires on a 50mm max travel suspension fork, with a rear "
                            "differential that lets the left and right rear wheels roll at different "
                            "speeds through turns and uneven roads.",
        },
        "highlights": [
            ("750W rear-wheel drive motor", "Rated 750W with 1,400W peak power and 85 N&middot;m of "
             "torque, driving the two rear wheels in a push mode so the front wheel does not slip."),
            ("85+ mile range", "A UL-certified SAMSUNG 48V 20Ah lithium battery delivers around 85+ "
             "miles on pedal assist level 1, and is rated for 800 charge cycles."),
            ("450 lbs of carrying capacity", "350 lbs on the trike plus 100 lbs on the rear rack, with "
             "a front basket and rear basket included."),
            ("One-piece moulding frame", "The unconventional undulating and extending ridges show "
             "beauty and strength. The main body of the vehicle tube is formed in one piece and "
             "requires no welding."),
            ("20\" x 4.0\" fat tires", "Wide fat tires on a 50mm max travel suspension fork, with "
             "180mm disc brakes front and rear to prevent rollover."),
            ("Safety and lighting", "A rear differential for stability, a parking brake, integrated "
             "headlight and horn, and a multifunctional tail light with a turn signal."),
        ],
        "who": [
            "<strong>Senior and limited-mobility riders</strong> &mdash; a step-through frame, a "
            "saddle with backrest and a parking brake make it easy to get on and ride.",
            "<strong>Commuters and errand runners</strong> &mdash; 85+ miles of range and a front "
            "plus rear basket cover a whole week of riding on one charge.",
            "<strong>Fat tire off-road riders</strong> &mdash; 20\" x 4.0\" tires and a rear "
            "differential keep the trike planted on gravel, grass and sand.",
            "<strong>Haulers</strong> &mdash; 350 lbs on the trike plus 100 lbs on the rear rack.",
        ],
        "warranty": POLICY["warranty"],
        "warranty_short": POLICY["warranty_short"],
        "assurance": "Ships 85% pre-assembled; follow the video to complete the final step.",
        "key_facts": ["85+ MI RANGE", "750W REAR DRIVE", "48V 20AH SAMSUNG",
                      "350 + 100 LBS PAYLOAD", "9-10 HR CHARGE"],
    },

    "mf-33": {
        "model": "MF-33",
        "product_name": "MaxFoot MF-33 Electric Tricycle For 2 Adults",
        "category": "Electric Tricycle For 2 Adults",
        "family_label": "MF-33 MaxLandau Rear Drive Electric Trike",
        "keywords": ["Rear Drive Electric Trike", "Electric Tricycle With Passenger Seat",
                     "Maxfoot Electric Trike", "Adults Electric Trike"],
        "lede": (
            "The MaxFoot MF-33 MaxLandau is a two-adult electric tricycle: a 750W rear-wheel drive "
            "brushless geared motor (85 N&middot;m torque), a UL-certified SAMSUNG 48V 20Ah lithium "
            "battery good for up to 85+ miles per charge, and a 27-inch padded bench seat that carries "
            "the rider plus two rear passengers. It ships with the battery, front basket, rear basket "
            "and seat belts included."),
        "metric_bodies": {
            "Rear Drive Motor": "A high-torque 750W rear drive brushless geared motor delivers 40% "
                                "more climbing efficiency than a front hub motor, so the MF-33 handles "
                                "hills smoothly even with a full passenger load.",
            "UL-Certified Battery": "A UL-certified SAMSUNG 48V 20Ah high-capacity battery powers the "
                                    "MF-33 for around 85+ miles on a single charge with pedal assist "
                                    "level 1.",
            "Payload Capacity": "A heavy-duty payload capacity of up to 500 lbs easily accommodates "
                                "the rider and two rear passengers. Gross weight is 220 lbs.",
            "Motor Torque": "The MF-33 is MaxFoot's first multi-passenger E-Trike: a 27-inch padded "
                            "bench seat with a backrest, footrests and armrests carries up to two "
                            "adults behind the rider, with seat belts.",
        },
        "highlights": [
            ("Seats up to three adults", "A 27-inch padded bench seat with a backrest, armrests and "
             "footrests takes the rider plus two rear passengers, with seat belts included."),
            ("750W rear-wheel drive", "A high-torque 750W rear drive brushless geared motor gives 40% "
             "more climbing efficiency than a front hub motor, so hills stay smooth with a full load."),
            ("85+ mile range", "A UL-certified SAMSUNG 48V 20Ah lithium battery delivers around 85+ "
             "miles on pedal assist level 1, and is rated for 800 charge cycles."),
            ("500 lbs payload", "A heavy-duty payload capacity of up to 500 lbs easily accommodates "
             "the rider and two rear passengers."),
            ("Rear differential stability", "The differential adjusts the speed difference between the "
             "left and right wheels so the MF-33 stays balanced and safe through turns and uneven roads."),
            ("Turn signals and safety belts", "Beyond the standard driving light and brake light, the "
             "taillight adds a turn signal function, and rear passengers are held by safety belts."),
        ],
        "who": [
            "<strong>Families</strong> &mdash; the first multi-passenger E-Trike in the MaxFoot line, "
            "built so a parent, a child and a grandparent can all ride together.",
            "<strong>Senior and limited-mobility riders</strong> &mdash; a low step-thru frame, a "
            "saddle with backrest and a 27-inch padded bench keep boarding and riding comfortable.",
            "<strong>Caregivers and companions</strong> &mdash; the rider stays in control of the "
            "handlebars while a passenger rides behind, with safety belts fitted.",
            "<strong>Errand and community runners</strong> &mdash; front and rear baskets included, "
            "85+ miles of range and a 500 lbs payload cover shopping and outings.",
        ],
        "warranty": POLICY["warranty"],
        "warranty_short": POLICY["warranty_short"],
        "assurance": "Ships with the battery, front basket, rear basket and seat belts included.",
        "key_facts": ["85+ MI RANGE", "750W REAR DRIVE", "48V 20AH SAMSUNG",
                      "500 LBS / 3 RIDERS", "9-10 HR CHARGE"],
    },
}

# MF-32 is the 24-inch sibling of the MaxZ platform: same platform, bigger tires.
import copy

FAMILIES["mf-32"] = copy.deepcopy(FAMILIES["mf-31"])
FAMILIES["mf-32"].update({
    "model": "MF-32",
    "product_name": "MaxFoot MF-32 MaxZ 24\" Fat Tire Electric Trikes For Adults",
    "family_label": "MaxZ 24\" Step-Thru Electric Trike",
    "keywords": ["Cargo Electric Trike", "Leisure Cargo Electric Tricycle",
                 "Maxfoot Electric Trike", "Rear Drive Electric Trike"],
    "lede": (
        "The MaxFoot MF-32 MaxZ 24\" is a step-through fat tire electric tricycle for adults: a 750W "
        "rear-wheel drive brushless geared motor (1,400W peak, 85 N&middot;m torque), a UL-certified "
        "SAMSUNG 48V 20Ah lithium battery good for up to 85+ miles per charge, Shimano 7-speed "
        "shifting, and a 350 lb rider rating plus a 100 lb rear rack. It ships 85% pre-assembled with "
        "the battery, front basket and rear basket included."),
})
FAMILIES["mf-32"]["metric_bodies"]["Motor Torque"] = (
    "Front 24\" x 4.0\" fat tires and rear 20\" x 4.0\" fat tires on a 50mm max travel suspension "
    "fork, with a rear differential that lets the left and right rear wheels roll at different "
    "speeds through turns and uneven roads.")
FAMILIES["mf-32"]["metric_bodies"]["Rear Drive Motor"] = (
    "The MAXFOOT motor gives the MAXZ 24\" electric trike a rated power of 750W, peak power of "
    "1400W and a powerful torque of 85N.m. In the new version in 2024 the motor moved to the rear "
    "wheel, so the vehicle is driven by the two rear wheels in a push mode.")
FAMILIES["mf-32"]["metric_bodies"]["UL-Certified Battery"] = (
    "A UL-certified SAMSUNG 48V 20Ah high-capacity battery powers the MAXZ 24\" for around 85+ "
    "miles on a single charge with pedal assist level 1.")
FAMILIES["mf-32"]["highlights"][4] = (
    "24\" x 4.0\" fat tires", "Front 24\" x 4.0\" and rear 20\" x 4.0\" fat tires on a 50mm max "
    "travel suspension fork, with 180mm disc brakes front and rear to prevent rollover.")
FAMILIES["mf-32"]["key_facts"] = ["85+ MI RANGE", "750W REAR DRIVE", "48V 20AH SAMSUNG",
                                  "350 + 100 LBS PAYLOAD", "9-10 HR CHARGE"]
